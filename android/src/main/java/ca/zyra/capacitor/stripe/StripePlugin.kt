package ca.zyra.capacitor.stripe

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.getcapacitor.*
import com.google.android.gms.wallet.AutoResolveHelper
import com.google.android.gms.wallet.PaymentData
import com.google.android.gms.wallet.PaymentDataRequest
import com.stripe.android.*
import com.stripe.android.model.*
import com.stripe.android.view.BillingAddressFields
import com.stripe.android.view.PaymentMethodsActivityStarter
import org.json.JSONException
import com.stripe.android.Stripe as Stripe2

@NativePlugin(requestCodes = [9972, 50000, 50001, 6000])
class Stripe : Plugin() {
    private lateinit var stripeInstance: Stripe2
    private lateinit var publishableKey: String
    private var isTest = true
    private var customerSession: CustomerSession? = null
    private var googlePayCallback: GooglePayCallback? = null

    @PluginMethod
    fun setStripeAccount(call: PluginCall) {
        call.success()
    }

    @PluginMethod
    fun setPublishableKey(call: PluginCall) {
        try {
            val key = call.getString("key")

            if (key == null || key == "") {
                call.error("you must provide a valid key")
                return
            }

            stripeInstance = Stripe2(context, key)
            publishableKey = key
            isTest = key.contains("test")
            PaymentConfiguration.init(context, key)
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

        val idempotencyKey = call.getString("idempotencyKey")
        val stripeAccountId = call.getString("stripeAccountId")

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

        stripeInstance.createCardToken(card, idempotencyKey, stripeAccountId, callback)
    }

    @PluginMethod
    fun createBankAccountToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val accountNumber = call.getString("account_number")
        val accountHolderName = call.getString("account_holder_name")
        val accountHolderType = call.getString("account_holder_type")
        val country = call.getString("country")
        val currency = call.getString("currency")
        val routingNumber = call.getString("routing_number")

        var stripeAccHolder = BankAccountTokenParams.Type.Individual

        if (accountHolderType == "company") {
            stripeAccHolder = BankAccountTokenParams.Type.Company
        }

        val bankAccount = BankAccountTokenParams(country, currency, accountNumber, stripeAccHolder, accountHolderName, routingNumber)

        val idempotencyKey = call.getString("idempotencyKey")
        val stripeAccountId = call.getString("stripeAccountId")

        val callback = object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val js = JSObject()

                if (result.bankAccount != null) {
                    val jsObj = bankAccountToJSON(result.bankAccount!!)
                    js.putOpt("bankAccount", jsObj)
                }

                js.put("id", result.id)
                js.put("created", result.created.getTime())
                js.put("type", result.type)
                js.put("object", "token")
                js.put("livemode", result.livemode)
                js.put("used", result.used)

                call.success(js)
            }

            override fun onError(e: Exception) {
                call.error("unable to create bank account token: " + e.localizedMessage, e)
            }
        }

        stripeInstance.createBankAccountToken(bankAccount, idempotencyKey, stripeAccountId, callback)
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

        val idempotencyKey = call.getString("idempotencyKey")
        val stripeAccountId = call.getString("stripeAccountId")

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

        val callback = object : ApiResultCallback<Source> {
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
        }

        stripeInstance.createSource(sourceParams, idempotencyKey, stripeAccountId, callback)
    }

    @PluginMethod
    fun createAccountToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val legalEntity = call.getObject("legalEntity")
        val tosShownAndAccepted = call.getBoolean("tosShownAndAccepted")

        val idempotencyKey = call.getString("idempotencyKey")
        val stripeAccountId = call.getString("stripeAccountId")

        var address: Address? = null

        if (legalEntity.has("address")) {
            try {
                val addressJson = legalEntity.getJSONObject("address")
                address = Address.fromJson(addressJson)
            } catch (err: JSONException) {
                Log.w(TAG, "failed to parse address from legal entity object")
                Log.w(TAG, err)
                Log.w(TAG, "submitting request without an address")
            }
        }

        var verifyFront: String? = null;
        var verifyBack: String? = null;

        if (legalEntity.has("verification")) {
            val verifyObj = legalEntity.getJSObject("verification")
            verifyFront = verifyObj.getString("front")
            verifyBack = verifyObj.getString("back")
        }

        val params: AccountParams
        val hasVerify = verifyFront != null || verifyBack != null

        when (legalEntity.getString("businessType")) {
            "company" -> {
                val builder = AccountParams.BusinessTypeParams.Company.Builder()
                        .setAddress(address)
                        .setName(legalEntity.getString("name"))
                        .setPhone(legalEntity.getString("phone"))

                if (hasVerify) {
                    val verifyDoc = AccountParams.BusinessTypeParams.Company.Document(verifyFront, verifyBack)
                    val verify = AccountParams.BusinessTypeParams.Company.Verification(verifyDoc)
                    builder.setVerification(verify)
                }

                params = AccountParams.create(tosShownAndAccepted, builder.build())
                Log.d(TAG, "preparing account params for company")
            }
            "individual" -> {
                val builder = AccountParams.BusinessTypeParams.Individual.Builder()
                        .setFirstName(legalEntity.getString("first_name"))
                        .setLastName(legalEntity.getString("last_name"))
                        .setEmail(legalEntity.getString("email"))
                        .setGender(legalEntity.getString("gender"))
                        .setIdNumber(legalEntity.getString("id_number"))
                        .setPhone(legalEntity.getString("phone"))
                        .setSsnLast4(legalEntity.getString("ssn_last4"))
                        .setAddress(address)

                if (hasVerify) {
                    val verifyDoc = AccountParams.BusinessTypeParams.Individual.Document(verifyFront, verifyBack)
                    val verify = AccountParams.BusinessTypeParams.Individual.Verification(verifyDoc)
                    builder.setVerification(verify)
                }

                params = AccountParams.create(tosShownAndAccepted, builder.build())
                Log.d(TAG, "preparing account params for individual")
            }
            else -> {
                params = AccountParams.create(tosShownAndAccepted)
                Log.d(TAG, "preparing account param with no no details other than acceptance")
            }
        }

        val callback = object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                Log.d(TAG, "account token was successfully created")
                val res = JSObject()
                res.putOpt("token", result.id)
                call.success(res)
            }

            override fun onError(e: Exception) {
                Log.d(TAG, "failed to create account token")
                call.error("unable to create account token: " + e.localizedMessage, e)
            }
        }

        stripeInstance.createAccountToken(params, idempotencyKey, stripeAccountId, callback)
    }

    @PluginMethod
    fun createPiiToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val pii = call.getString("pii")
        val idempotencyKey = call.getString("idempotencyKey")
        val stripeAccountId = call.getString("stripeAccountId")
        val callback = object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val res = JSObject()
                res.putOpt("id", result.id)
                call.success(res)
            }

            override fun onError(e: Exception) {
                call.error("unable to create pii token: " + e.localizedMessage, e)
            }
        }

        stripeInstance.createPiiToken(pii, idempotencyKey, stripeAccountId, callback)
    }

    @PluginMethod
    fun confirmPaymentIntent(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val clientSecret = call.getString("clientSecret")
        val saveMethod = call.getBoolean("saveMethod", false)
        val redirectUrl = call.getString("redirectUrl", null)
        val stripeAccountId = call.getString("stripeAccountId")
        val session = if(call.getString("setupFutureUsage") == "on_session")  ConfirmPaymentIntentParams.SetupFutureUsage.OnSession  else ConfirmPaymentIntentParams.SetupFutureUsage.OffSession
        var setupFutureUsage = if(saveMethod!!) session else null
        val params: ConfirmPaymentIntentParams

        when {
            call.hasOption("card") -> {
                var card = call.getObject("card")
                var address = Address.Builder()
                        .setLine1(card.optString("address_line1"))
                        .setLine2(card.optString("address_line2"))
                        .setCity(card.optString("address_city"))
                        .setState(card.optString("address_state"))
                        .setCountry(card.optString("address_country"))
                        .setPostalCode(card.optString("address_zip"))
                        .build()
                var billing_details = PaymentMethod.BillingDetails().toBuilder()
                        .setEmail(card.optString("email"))
                        .setName(card.optString("name"))
                        .setPhone(card.optString("phone"))
                        .setAddress(address)
                        .build()
                val cardParams = buildCard(card)
                        .build()
                        .toPaymentMethodParamsCard()
                val pmCreateParams = PaymentMethodCreateParams.create(cardParams, billing_details)
                params = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmCreateParams, clientSecret, redirectUrl, saveMethod!!, setupFutureUsage=setupFutureUsage)
            }

            call.hasOption("paymentMethodId") -> {
                params = ConfirmPaymentIntentParams.createWithPaymentMethodId(call.getString("paymentMethodId"), clientSecret, redirectUrl, saveMethod!!)
            }

            call.hasOption("sourceId") -> {
                params = ConfirmPaymentIntentParams.createWithSourceId(call.getString("sourceId"), clientSecret, redirectUrl, saveMethod!!)
            }

            call.hasOption("googlePayOptions") -> {
                val opts = call.getObject("googlePayOptions")
                val cb = object : GooglePayCallback() {
                    override fun onSuccess(res: PaymentData) {
                        try {
                            val pmParams = PaymentMethodCreateParams.createFromGooglePay(JSObject(res.toJson()))
                            val confirmParams = ConfirmPaymentIntentParams.createWithPaymentMethodCreateParams(pmParams, clientSecret, redirectUrl, saveMethod)
                            stripeInstance.confirmPayment(activity, confirmParams, stripeAccountId)
                        } catch (e: JSONException) {
                            savedCall?.error("unable to parse json: " + e.localizedMessage, e)
                            freeSavedCall()
                        }
                    }

                    override fun onError(err: Exception) {
                        savedCall?.error(err.localizedMessage, err)
                        freeSavedCall()
                    }

                }
                saveCall(call)
                processGooglePayTx(opts, cb)
                return
            }

            call.hasOption("applePayOptions") -> {
                call.error("ApplePay is not supported on Android")
                return
            }

            else -> {
                params = ConfirmPaymentIntentParams.create(clientSecret, redirectUrl)
            }
        }


        stripeInstance.confirmPayment(activity, params, stripeAccountId)
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

        val stripeAccountId = call.getString("stripeAccountId")

        stripeInstance.confirmSetupIntent(activity, params, stripeAccountId)
        saveCall(call)
    }

    @PluginMethod
    fun presentPayment(call: PluginCall) {
        PaymentConfiguration.init(context, publishableKey)

        val activ = PaymentMethodsActivityStarter.Args.Builder()
                .setPaymentConfiguration(PaymentConfiguration.getInstance(context))
                .setPaymentMethodTypes(listOf(PaymentMethod.Type.Card))
                .setBillingAddressFields(BillingAddressFields.PostalCode)
                .setPaymentConfiguration(PaymentConfiguration.getInstance(context))
                .setIsPaymentSessionActive(true)
                .setShouldShowGooglePay(true)
                .setCanDeletePaymentMethods(true)
                .setIsPaymentSessionActive(false)
                .build()

        PaymentMethodsActivityStarter(activity).startForResult(activ)

        call.resolve()
    }

    @PluginMethod
    fun isApplePayAvailable(call: PluginCall) {
        call.resolve(JSObject().put("available", false))
    }

    @PluginMethod
    fun isGooglePayAvailable(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val env = GetGooglePayEnv(isTest)
        val paymentsClient = GooglePayPaymentsClient(context, env)
        val req = GooglePayDummyRequest()

        paymentsClient.isReadyToPay(req)
                .addOnCompleteListener { task ->
                    val obj = JSObject()
                    obj.putOpt("available", task.isSuccessful)
                    call.resolve(obj)
                }
    }

    @PluginMethod
    fun payWithGooglePay(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        val opts = call.getObject("googlePayOptions")

        val cb = object : GooglePayCallback() {
            override fun onSuccess(res: PaymentData) {
                val tokenJs = JSObject(res.toJson())
                val resJs = JSObject()

                resJs.put("success", true)
                resJs.put("token", tokenJs)
                call.resolve(resJs)
            }

            override fun onError(err: Exception) {
                call.error(err.localizedMessage, err)
            }
        }

        processGooglePayTx(opts, cb)
    }

    @PluginMethod
    fun initCustomerSession(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        try {
            CustomerSession.initCustomerSession(context, EphKeyProvider(call.data.toString()), true)
            customerSession = CustomerSession.getInstance()

            call.resolve()
        } catch (e: java.lang.Exception) {
            call.reject("unable to init customer session: " + e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun customerPaymentMethods(call: PluginCall) {
        if (!ensureCustomerSessionInitialized(call)) {
            return
        }

        val callback = object : PaymentMethodsCallback() {
            override fun onSuccess(paymentMethods: List<PaymentMethod>) {
                Log.d(TAG, "Retrieved customer payment methods successfully")

                val arr = JSArray()

                for (pm in paymentMethods) {
                    arr.put(pmToJson(pm))
                }

                val res = JSObject()
                res.put("paymentMethods", arr)
                call.success(res)
            }

            override fun onError(err: Exception) {
                Log.e(TAG, "Failed to retrieve customer payment methods", err)
                call.reject(err.localizedMessage, err)
            }
        }

        customerSession!!.getPaymentMethods(
                PaymentMethod.Type.Card,
                StripePaymentMethodsListener(callback = callback)
        )
    }

    @PluginMethod
    fun setCustomerDefaultSource(call: PluginCall) {
        if (!ensureCustomerSessionInitialized(call)) {
            return
        }

        val sourceId = call.getString("sourceId")
        val type = call.getString("type", "card")

        if (sourceId == null || sourceId.isEmpty()) {
            call.reject("You must provide a value for sourceId")
            return
        }

        customerSession!!.setCustomerDefaultSource(sourceId, type, object : CustomerSession.CustomerRetrievalListener {
            override fun onCustomerRetrieved(customer: Customer) {
                customerPaymentMethods(call)
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        })
    }

    @PluginMethod
    fun addCustomerSource(call: PluginCall) {
        if (!ensureCustomerSessionInitialized(call)) {
            return
        }

        val sourceId = call.getString("sourceId")
        val type = call.getString("type", "card")

        if (sourceId == null) {
            call.reject("you must provide a sourceId")
            return
        }

        val listener = object : CustomerSession.SourceRetrievalListener {
            override fun onSourceRetrieved(source: Source) {
                customerPaymentMethods(call)
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        }

        customerSession!!.addCustomerSource(sourceId, type, listener)
    }

    @PluginMethod
    fun deleteCustomerSource(call: PluginCall) {
        if (!ensureCustomerSessionInitialized(call)) {
            return
        }

        val sourceId = call.getString("sourceId")

        if (sourceId == null) {
            call.reject("you must provide a sourceId")
            return
        }

        val listener = object : CustomerSession.SourceRetrievalListener {
            override fun onSourceRetrieved(source: Source) {
                customerPaymentMethods(call)
            }

            override fun onError(errorCode: Int, errorMessage: String, stripeError: StripeError?) {
                call.reject(errorMessage, java.lang.Exception(errorMessage))
            }
        }

        customerSession!!.deleteCustomerSource(sourceId, listener)
    }

    /**
     * Ensures that setPublishableKey was called and stripeInstance exists.
     * Rejects the call with an error and returns false if the plugin is not ready.
     *
     * @param call {PluginCall} current method call
     * @return {boolean} returns true if the plugin is ready
     */
    private fun ensurePluginInitialized(call: PluginCall): Boolean {
        Log.d(TAG, "checking if plugin was initialized")

        if (!::stripeInstance.isInitialized) {
            Log.d(TAG, "plugin was not initialized, ending capacitor call here")
            call.error(ERR_STRIPE_NOT_INITIALIZED)
            return false
        }

        Log.d(TAG, "plugin is initialized")

        return true
    }

    private fun ensureCustomerSessionInitialized(call: PluginCall): Boolean {
        Log.d(TAG, "checking if customer session was initialized")

        if (customerSession == null) {
            Log.d(TAG, "customer session was not initialized, ending capacitor call here")
            call.reject(ERR_NO_ACTIVE_CUSTOMER_SESSION)
            return false
        }

        Log.d(TAG, "customer session is initialized")

        return true
    }

    private fun handleGooglePayActivityResult(resultCode: Int, data: Intent?) {
        Log.v(TAG, "handleGooglePayActivityResult called with resultCode: $resultCode")

        if (googlePayCallback == null) {
            Log.e(TAG, "GooglePay :: got a result but there is no callback saved")
            return
        }

        val cb = googlePayCallback!!
        googlePayCallback = null

        when (resultCode) {
            Activity.RESULT_OK -> {
                if (data == null) {
                    Log.e(TAG, "GooglePay :: result was ok but data was null")
                    cb.onError(Exception("unexpected error occurred"))
                    return
                }

                val paymentData = PaymentData.getFromIntent(data)

                if (paymentData == null) {
                    Log.e(TAG, "GooglePay :: result was ok but PaymentData was null")
                    cb.onError(Exception("unexpected error occurred"))
                    return
                }

                cb.onSuccess(paymentData)
            }

            Activity.RESULT_CANCELED, AutoResolveHelper.RESULT_ERROR -> {
                val status = AutoResolveHelper.getStatusFromIntent(data)

                if (status != null) {
                    cb.onError(Exception(status.statusMessage))
                } else {
                    cb.onError(Exception("transaction was cancelled"))
                }
            }
        }
    }

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
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

        if (requestCode == PaymentMethodsActivityStarter.REQUEST_CODE) {
            val res = PaymentMethodsActivityStarter.Result.fromIntent(data)

            if (res == null) {
                call.error("user cancelled")
                freeSavedCall()
                return
            }

            val js = JSObject()
            js.put("useGooglePay", res.useGooglePay)

            if (res.paymentMethod != null) {
                js.put("paymentMethod", pmToJson(res.paymentMethod!!))
            }

            call.success(js)
            freeSavedCall()
            return
        }

        Log.d(TAG, "passing activity result to stripe")

        val paymentResultCallback = object : ApiResultCallback<PaymentIntentResult> {
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
        }

        val setupResultCallback = object : ApiResultCallback<SetupIntentResult> {
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
        }

        stripeInstance.onPaymentResult(requestCode, data, paymentResultCallback)
        stripeInstance.onSetupResult(requestCode, data, setupResultCallback)
    }

    private fun processGooglePayTx(opts: JSObject, callback: GooglePayCallback) {
        val env = GetGooglePayEnv(isTest)

        Log.d(TAG, "initGooglePay :: [Testing = $isTest] :: [ENV = $env]")

        val paymentsClient = GooglePayPaymentsClient(context, env)

        try {
            val paymentDataReq = GooglePayDataReq(publishableKey, opts)

            if (BuildConfig.DEBUG) {
                Log.d(TAG, "initGooglePay :: [payment data = $paymentDataReq]")
            }

            val req = PaymentDataRequest.fromJson(paymentDataReq)

            googlePayCallback = callback

            AutoResolveHelper.resolveTask(
                    paymentsClient.loadPaymentData(req),
                    activity,
                    LOAD_PAYMENT_DATA_REQUEST_CODE
            )
        } catch (e: JSONException) {
            Log.e(TAG, "Failed to parse json object", e)
            callback.onError(e)
        }
    }
}
