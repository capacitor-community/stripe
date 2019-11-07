package ca.zyra.capacitor.stripe

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.getcapacitor.*
import com.google.android.gms.wallet.*
import com.stripe.android.*
import com.stripe.android.model.*
import org.json.JSONException

@NativePlugin(requestCodes = [9972, 50000, 50001])
class StripePlugin : Plugin() {
    private lateinit var stripeInstance: Stripe
    private lateinit var publishableKey: String
    private var isTest = true
    private var googlePayPaymentData: PaymentData? = null
    private var customerSession: CustomerSession? = null

    @PluginMethod
    fun echo(call: PluginCall) {
        val value = call.getString("value")

        val ret = JSObject()
        ret.putOpt("value", value)
        call.success(ret)
    }

    @PluginMethod
    fun setPublishableKey(call: PluginCall) {
        try {
            val key = call.getString("key")

            if (key == null || key == "") {
                call.error("you must provide a valid key")
                return
            }

            stripeInstance = Stripe(context, key)
            publishableKey = key
            isTest = key.contains("test")

            call.success()
        } catch (e: Exception) {
            call.error("unable to set publishable key: " + e.localizedMessage, e)
        }

    }

    @PluginMethod
    fun identifyCardBrand(call: PluginCall) {
        val res = JSObject()
        res.putOpt("brand", buildCard(call.data).build().brand)
        call.success(res)
    }

    @PluginMethod
    fun validateCardNumber(call: PluginCall) {
        val res = JSObject()
        res.putOpt("valid", buildCard(call.data).build().validateNumber())
        call.success(res)
    }

    @PluginMethod
    fun validateExpiryDate(call: PluginCall) {
        val res = JSObject()
        res.putOpt("valid", buildCard(call.data).build().validateExpiryDate())
        call.success(res)
    }

    @PluginMethod
    fun validateCVC(call: PluginCall) {
        val res = JSObject()
        res.putOpt("valid", buildCard(call.data).build().validateCVC())
        call.success(res)
    }

    @PluginMethod
    fun createCardToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val card = buildCard(call.data).build()

        if (!card.validateCard()) {
            call.error("invalid card information")
            return
        }

        val callback = object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val tokenJs = JSObject()
                val cardJs = cardToJSON(result.card!!)

                tokenJs.putOpt("card", cardJs)
                tokenJs.putOpt("id", result.id)
                tokenJs.putOpt("created", result.created)
                tokenJs.putOpt("type", result.type)

                call.success(tokenJs)
            }

            override fun onError(e: Exception) {
                call.error("unable to create token: " + e.localizedMessage, e)
            }
        }

        stripeInstance.createToken(card, callback)
    }

    @PluginMethod
    fun createBankAccountToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val bankAccount = BankAccount(
                call.getString("account_number"),
                call.getString("country"),
                call.getString("currency"),
                call.getString("routing_number")
        )

        stripeInstance.createBankAccountToken(bankAccount, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val tokenJs = JSObject()

                if (result.bankAccount != null) {
                    val jsObj = bankAccountToJSON(result.bankAccount!!)
                    tokenJs.putOpt("bankAccount", jsObj)
                }

                tokenJs.putOpt("id", result.id)
                tokenJs.putOpt("created", result.created)
                tokenJs.putOpt("type", result.type)

                call.success(tokenJs)
            }

            override fun onError(e: Exception) {
                call.error("unable to create bank account token: " + e.localizedMessage, e)
            }
        })
    }

    @PluginMethod
    fun createSourceToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val sourceParams: SourceParams

        val sourceType = call.getInt("sourceType")
        val amount = call.getFloat("amount")!!.toLong()
        val currency = call.getString("currency")
        val returnURL = call.getString("returnURL")
        val card = call.getString("card")
        val name = call.getString("name")
        val statementDescriptor = call.getString("statementDescriptor")
        val bank = call.getString("bank")
        val iban = call.getString("iban")
        val addressLine1 = call.getString("address_line1")
        val city = call.getString("city")
        val zip = call.getString("address_zip")
        val country = call.getString("country")
        val email = call.getString("email")
        val callId = call.getString("callId")

        when (sourceType) {
            0 -> sourceParams = SourceParams.createThreeDSecureParams(amount, currency, returnURL, card)

            1 -> sourceParams = SourceParams.createGiropayParams(amount, name, returnURL, statementDescriptor)

            2 -> sourceParams = SourceParams.createIdealParams(amount, name, returnURL, statementDescriptor, bank)

            3 -> sourceParams = SourceParams.createSepaDebitParams(name, iban, addressLine1, city, zip, country)

            4 -> sourceParams = SourceParams.createSofortParams(amount, returnURL, country, statementDescriptor)

            5 -> sourceParams = SourceParams.createAlipaySingleUseParams(amount, currency, name, email, returnURL)

            6 -> sourceParams = SourceParams.createAlipayReusableParams(currency, name, email, returnURL)

            7 -> sourceParams = SourceParams.createP24Params(amount, currency, name, email, returnURL)

            8 -> sourceParams = SourceParams.createVisaCheckoutParams(callId)

            else -> return
        }

        stripeInstance.createSource(sourceParams, object : ApiResultCallback<Source> {
            override fun onSuccess(result: Source) {
                val tokenJs = JSObject()
                tokenJs.putOpt("id", result.id)
                tokenJs.putOpt("created", result.created)
                tokenJs.putOpt("type", result.type)
                call.success(tokenJs)
            }

            override fun onError(e: Exception) {
                call.error("unable to create source token: " + e.localizedMessage, e)
            }
        })
    }

    @PluginMethod
    fun createAccountToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val legalEntity = call.getObject("legalEntity")
        val businessType = call.getString("businessType")
        val tosShownAndAccepted = call.getBoolean("tosShownAndAccepted")
        val bt = if (businessType == "company") AccountParams.BusinessType.Company else AccountParams.BusinessType.Individual
        val params = AccountParams.createAccountParams(tosShownAndAccepted!!, bt, jsonToHashMap(legalEntity))

        stripeInstance.createAccountToken(params, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val res = JSObject()
                res.putOpt("token", result.id)
                call.success(res)
            }

            override fun onError(e: Exception) {
                call.error("unable to create account token: " + e.localizedMessage, e)
            }
        })
    }

    @PluginMethod
    fun createPiiToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val pii = call.getString("pii")
        stripeInstance.createPiiToken(pii, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val res = JSObject()
                res.putOpt("id", result.id)
                call.success(res)
            }

            override fun onError(e: Exception) {
                call.error("unable to create pii token: " + e.localizedMessage, e)
            }
        })
    }

    @PluginMethod
    fun confirmPaymentIntent(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val clientSecret = call.getString("clientSecret")
        val saveMethod = call.getBoolean("saveMethod", false)
        val redirectUrl = call.getString("redirectUrl", null)

        val params: ConfirmPaymentIntentParams

        if (call.hasOption("card")) {
            val cb = buildCard(call.getObject("card")) // TODO fix this, we need to pass call.getObject(card)xs
            val cardParams = cb.build().toPaymentMethodParamsCard()
            val pmCreateParams = PaymentMethodCreateParams.create(cardParams)
            params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmCreateParams, clientSecret, redirectUrl, saveMethod!!)
        } else if (call.hasOption("paymentMethodId")) {
            params = ConfirmPaymentIntentParams.createWithPaymentMethodId(call.getString("paymentMethodId"), clientSecret, redirectUrl, saveMethod!!)
        } else if (call.hasOption("sourceId")) {
            params = ConfirmPaymentIntentParams.createWithSourceId(call.getString("sourceId"), clientSecret, redirectUrl, saveMethod!!)
        } else if (call.getBoolean("fromGooglePay", false)!!) {
            try {
                val js = googlePayPaymentData!!.toJson()
                val gpayObj = JSObject(js)

                googlePayPaymentData = null

                val pmcp = PaymentMethodCreateParams.createFromGooglePay(gpayObj)
                params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmcp, clientSecret, redirectUrl, saveMethod!!)
            } catch (e: JSONException) {
                call.error("unable to parse json: " + e.localizedMessage, e)
                return
            }

        } else {
            params = ConfirmPaymentIntentParams.create(clientSecret, redirectUrl)
        }

        stripeInstance.confirmPayment(activity, params)
        saveCall(call)
    }

    @PluginMethod
    fun confirmSetupIntent(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val clientSecret = call.getString("clientSecret")
        val redirectUrl = call.getString("redirectUrl")

        val params: ConfirmSetupIntentParams

        when {
            call.hasOption("card") -> {
                val cb = buildCard(call.getObject("card"))
                val cardParams = cb.build().toPaymentMethodParamsCard()
                val pmCreateParams = PaymentMethodCreateParams.create(cardParams)
                params = ConfirmSetupIntentParams.create(pmCreateParams, clientSecret, redirectUrl)
            }

            call.hasOption("paymentMethodId") -> {
                params = ConfirmSetupIntentParams.create(call.getString("paymentMethodId"), clientSecret, redirectUrl)
            }

            else -> {
                params = ConfirmSetupIntentParams.createWithoutPaymentMethod(clientSecret, redirectUrl)
            }
        }

        stripeInstance.confirmSetupIntent(activity, params)
        saveCall(call)
    }

    @PluginMethod
    fun customizePaymentAuthUI(call: PluginCall) {
        call.resolve()
    }

    @PluginMethod
    fun isGooglePayAvailable(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val paymentsClient = Wallet.getPaymentsClient(
                context,
                Wallet.WalletOptions.Builder()
                        .setEnvironment(if (isTest) WalletConstants.ENVIRONMENT_TEST else WalletConstants.ENVIRONMENT_PRODUCTION)
                        .build()
        )

        val allowedAuthMethods = JSArray()
        allowedAuthMethods.put("PAN_ONLY")
        allowedAuthMethods.put("CRYPTOGRAM_3DS")

        val allowedCardNetworks = JSArray()
        allowedCardNetworks.put("AMEX")
        allowedCardNetworks.put("DISCOVER")
        allowedCardNetworks.put("JCB")
        allowedCardNetworks.put("MASTERCARD")
        allowedCardNetworks.put("VISA")

        val isReadyToPayRequestJson = JSObject()
        isReadyToPayRequestJson.putOpt("allowedAuthMethods", allowedAuthMethods)
        isReadyToPayRequestJson.putOpt("allowedCardNetworks", allowedCardNetworks)

        val req = IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString())
        paymentsClient.isReadyToPay(req)
                .addOnCompleteListener { task ->
                    val obj = JSObject()
                    obj.putOpt("available", task.isSuccessful)
                    call.resolve(obj)
                }
    }

    @PluginMethod
    fun startGooglePayTransaction(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val isTest = this.isTest
        val env = if (isTest) WalletConstants.ENVIRONMENT_TEST else WalletConstants.ENVIRONMENT_PRODUCTION

        Log.d(TAG, "startGooglePayTransaction | isTest: " + (if (isTest) "TRUE" else "FALSE") + " | env: " + if (env == WalletConstants.ENVIRONMENT_TEST) "TEST" else "PROD")

        val paymentsClient = Wallet.getPaymentsClient(
                context,
                Wallet.WalletOptions.Builder()
                        .setEnvironment(env)
                        .build()
        )

        try {
            // PAN_ONLY, CRYPTOGRAM_3DS
            val defaultAuthMethods = JSArray()
            defaultAuthMethods.put("PAN_ONLY")
            defaultAuthMethods.put("CRYPTOGRAM_3DS")

            val defaultCardNetworks = JSArray()
            defaultCardNetworks.put("AMEX")
            defaultCardNetworks.put("DISCOVER")
            defaultCardNetworks.put("JCB")
            defaultCardNetworks.put("MASTERCARD")
            defaultCardNetworks.put("VISA")

            val totalPrice = call.getString("totalPrice")
            val totalPriceStatus = call.getString("totalPriceStatus")
            val currencyCode = call.getString("currencyCode")
            val merchantName = call.getString("merchantName")

            val emailRequired = call.getBoolean("emailRequired", false)
            val billingAddressRequired = call.getBoolean("billingAddressRequired", false)
            val allowPrepaidCards = call.getBoolean("allowPrepaidCards", true)
            val shippingAddressRequired = call.getBoolean("shippingAddressRequired", false)

            val authMethods = call.getArray("allowedAuthMethods", defaultAuthMethods)
            val cardNetworks = call.getArray("allowedCardNetworks", defaultCardNetworks)

            val billingAddressParams = call.getObject("billingAddressParams", JSObject())

            if (!billingAddressParams.has("format")) {
                billingAddressParams.putOpt("format", "MIN")
            }

            if (!billingAddressParams.has("phoneNumberRequired")) {
                billingAddressParams.putOpt("phoneNumberRequired", false)
            }

            val shippingAddressParams = call.getObject("shippingAddressParameters", JSObject())

            val params = JSObject()
                    .putOpt("allowedAuthMethods", authMethods)
                    .putOpt("allowedCardNetworks", cardNetworks)
                    .putOpt("billingAddressRequired", billingAddressRequired)
                    .putOpt("allowPrepaidCards", allowPrepaidCards)
                    .putOpt("billingAddressParameters", billingAddressParams)

            val tokenizationSpec = GooglePayConfig(publishableKey).tokenizationSpecification

            val cardPaymentMethod = JSObject()
                    .putOpt("type", "CARD")
                    .putOpt("parameters", params)
                    .putOpt("tokenizationSpecification", tokenizationSpec)

            val txInfo = JSObject()
            txInfo.putOpt("totalPrice", totalPrice)
            txInfo.putOpt("totalPriceStatus", totalPriceStatus)
            txInfo.putOpt("currencyCode", currencyCode)

            val paymentDataReq = JSObject()
                    .putOpt("apiVersion", 2)
                    .putOpt("apiVersionMinor", 0)
                    .putOpt("allowedPaymentMethods", JSArray().put(cardPaymentMethod))
                    .putOpt("transactionInfo", txInfo)
                    .putOpt("emailRequired", emailRequired)

            if (merchantName != null) {
                paymentDataReq.putOpt("merchantInfo", JSObject().putOpt("merchantName", merchantName))
            }

            if (shippingAddressRequired!!) {
                paymentDataReq.putOpt("shippingAddressRequired", true)
                paymentDataReq.putOpt("shippingAddressParameters", shippingAddressParams)
            }

            val paymentDataReqStr = paymentDataReq.toString()

            Log.d(TAG, "payment data is: $paymentDataReqStr")

            val req = PaymentDataRequest.fromJson(paymentDataReqStr)

            AutoResolveHelper.resolveTask(
                    paymentsClient.loadPaymentData(req),
                    activity,
                    LOAD_PAYMENT_DATA_REQUEST_CODE
            )

            saveCall(call)
        } catch (e: JSONException) {
            call.error("json parsing error: " + e.localizedMessage, e)
        }

    }

    @PluginMethod
    fun initCustomerSession(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        try {
            CustomerSession.initCustomerSession(context, EphKeyProvider(call.data.toString()))
            customerSession = CustomerSession.getInstance()

            call.resolve()
        } catch (e: java.lang.Exception) {
            call.reject("unable to init customer session: " + e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun customerPaymentMethods(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val cs = customerSession

        if (cs == null) {
            call.reject("you must call initCustomerSession first")
            return
        }

        val l = StripePaymentMethodsListener(callback = object : PaymentMethodsCallback() {
            override fun onSuccess(paymentMethods: MutableList<PaymentMethod>) {
                val arr = JSArray()

                for (pm in paymentMethods) {
                    val obj = JSObject()
                    obj.putOpt("created", pm.created)
                    obj.putOpt("customerId", pm.customerId)
                    obj.putOpt("id", pm.id)
                    obj.putOpt("livemode", pm.liveMode)
                    obj.putOpt("type", pm.type)

                    if (pm.card != null) {
                        val co = JSObject()
                        val c: PaymentMethod.Card = pm.card!!
                        co.putOpt("brand", c.brand)
                        co.putOpt("checks", c.checks)
                        co.putOpt("country", c.country)
                        co.putOpt("exp_month", c.expiryMonth)
                        co.putOpt("exp_year", c.expiryYear)
                        co.putOpt("funding", c.funding)
                        co.putOpt("last4", c.last4)
                        co.putOpt("threeDSecureUsage", c.threeDSecureUsage?.isSupported)
                        obj.put("card", co)
                    }

                    arr.put(obj)
                }

                val res = JSObject()
                res.put("paymentMethods", arr)
                call.success(res)
            }

            override fun onError(err: Exception) {
                call.reject(err.localizedMessage, err)
            }
        })

        cs.getPaymentMethods(PaymentMethod.Type.Card, l)
    }

    @PluginMethod
    fun setCustomerDefaultSource(call: PluginCall) {
        if (customerSession == null) {
            call.reject("you must call initCustomerSession first")
            return
        }

        val sourceId = call.getString("sourceId")
        val type = call.getString("type", "card")

        if (sourceId == null) {
            call.reject("you must provide a sourceId")
            return
        }

        customerSession!!.setCustomerDefaultSource(sourceId, type, object : CustomerSession.CustomerRetrievalListener {
            override fun onCustomerRetrieved(customer: Customer) {
                call.success()
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        })
    }

    @PluginMethod
    fun addCustomerSource(call: PluginCall) {
        if (customerSession == null) {
            call.reject("you must call initCustomerSession first")
            return
        }

        val sourceId = call.getString("sourceId")
        val type = call.getString("type", "card")

        if (sourceId == null) {
            call.reject("you must provide a sourceId")
            return
        }

        customerSession!!.addCustomerSource(sourceId, type, object : CustomerSession.SourceRetrievalListener {
            override fun onSourceRetrieved(source: Source) {
                call.success()
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        })
    }

    @PluginMethod
    fun deleteCustomerSource(call: PluginCall) {
        if (customerSession == null) {
            call.reject("you must call initCustomerSession first")
            return
        }

        val sourceId = call.getString("sourceId")

        if (sourceId == null) {
            call.reject("you must provide a sourceId")
            return
        }

        customerSession!!.deleteCustomerSource(sourceId, object : CustomerSession.SourceRetrievalListener {
            override fun onSourceRetrieved(source: Source) {
                call.success()
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        })
    }

    /**
     * Ensures that setPublishableKey was called and stripeInstance exists.
     * Rejects the call with an error and returns false if the plugin is not ready.
     *
     * @param call {PluginCall} current method call
     * @return {boolean} returns true if the plugin is ready
     */
    private fun ensurePluginInitialized(call: PluginCall): Boolean {
        if (!::stripeInstance.isInitialized) {
            call.error("you must call setPublishableKey to initialize the plugin before calling this method")
            return false
        }

        return true
    }

    private fun handleGooglePayActivityResult(resultCode: Int, data: Intent?) {
        Log.v(TAG, "handleGooglePayActivityResult called with resultCode: $resultCode")
        val googlePayCall = savedCall

        if (googlePayCall == null) {
            Log.e(TAG, "no saved PluginCall was found")
            return
        }

        when (resultCode) {
            Activity.RESULT_OK -> {
                if (data == null) {
                    googlePayCall.error("an unexpected error occurred")
                    Log.e(TAG, "data is null")
                    return
                }

                val paymentData = PaymentData.getFromIntent(data)

                if (paymentData == null) {
                    Log.e(TAG, "paymentData is null")
                    googlePayCall.error("an unexpected error occurred")
                    return
                }

                googlePayPaymentData = paymentData

                googlePayCall.resolve()
            }

            Activity.RESULT_CANCELED, AutoResolveHelper.RESULT_ERROR -> {
                val status = AutoResolveHelper.getStatusFromIntent(data)
                val obj = JSObject()

                if (status != null) {
                    obj.putOpt("canceled", status.isCanceled)
                    obj.putOpt("interrupted", status.isInterrupted)
                    obj.putOpt("success", status.isSuccess)
                    obj.putOpt("code", status.statusCode)
                    obj.putOpt("message", status.statusMessage)
                    obj.putOpt("resolution", status.resolution)
                } else {
                    obj.putOpt("canceled", true)
                }

                googlePayCall.resolve(obj)
            }
        }


        freeSavedCall()
    }

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent) {
        super.handleOnActivityResult(requestCode, resultCode, data)

        Log.d(TAG, "handleOnActivityResult called with request code: $requestCode and resultCode: $resultCode")

        if (requestCode == LOAD_PAYMENT_DATA_REQUEST_CODE) {
            Log.d(TAG, "requestCode matches GooglePay, forwarding data to handleGooglePayActivityResult")
            handleGooglePayActivityResult(resultCode, data)
            return
        }

        val call = savedCall

        if (call == null) {
            Log.d(TAG, "could not find a saved PluginCall, discarding activity result")
            return
        }

        Log.d(TAG, "passing activity result to stripe")

        stripeInstance.onPaymentResult(requestCode, data, object : ApiResultCallback<PaymentIntentResult> {
            override fun onSuccess(result: PaymentIntentResult) {
                Log.d(TAG, "onPaymentResult.onSuccess called")
                val pi = result.intent
                val res = paymentIntentToJSON(pi)
                call.success(res)
                freeSavedCall()
            }

            override fun onError(e: Exception) {
                Log.d(TAG, "onPaymentResult.onError called")
                call.error("unable to complete transaction: " + e.localizedMessage, e)
                freeSavedCall()
            }
        })

        stripeInstance.onSetupResult(requestCode, data, object : ApiResultCallback<SetupIntentResult> {
            override fun onSuccess(result: SetupIntentResult) {
                Log.d(TAG, "onSetupResult.onSuccess called")
                val si = result.intent
                val res = setupIntentToJSON(si)
                call.success(res)
                freeSavedCall()
            }

            override fun onError(e: Exception) {
                Log.d(TAG, "onSetupResult.onError called")
                call.error("unable to complete transaction: " + e.localizedMessage, e)
                freeSavedCall()
            }
        })
    }
}
