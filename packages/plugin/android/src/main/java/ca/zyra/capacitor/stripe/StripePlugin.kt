package ca.zyra.capacitor.stripe

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.getcapacitor.*
import com.google.android.gms.wallet.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.stripe.android.*
import com.stripe.android.model.*
import org.json.JSONException
import org.json.JSONObject
import java.util.*

@NativePlugin(requestCodes = [9972, 50000, 50001])
class StripePlugin : Plugin() {
    private var stripeInstance: Stripe? = null
    private var publishableKey: String? = null
    private var isTest = true
    private var googlePayPaymentData: PaymentData? = null

    @PluginMethod
    fun echo(call: PluginCall) {
        val value = call.getString("value")

        val ret = JSObject()
        ret.put("value", value)
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
        res.put("brand", buildCard(call).build().brand)
        call.success(res)
    }

    @PluginMethod
    fun validateCardNumber(call: PluginCall) {
        val res = JSObject()
        res.put("valid", buildCard(call).build().validateNumber())
        call.success(res)
    }

    @PluginMethod
    fun validateExpiryDate(call: PluginCall) {
        val res = JSObject()
        res.put("valid", buildCard(call).build().validateExpiryDate())
        call.success(res)
    }

    @PluginMethod
    fun validateCVC(call: PluginCall) {
        val res = JSObject()
        res.put("valid", buildCard(call).build().validateCVC())
        call.success(res)
    }

    @PluginMethod
    fun createCardToken(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }


        val card = buildCard(call).build()

        if (!card.validateCard()) {
            call.error("invalid card information")
            return
        }

        val callback = object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val tokenJs = JSObject()
                val cardJs = cardToJSON(result.card!!)

                tokenJs.put("card", cardJs)
                tokenJs.put("id", result.id)
                tokenJs.put("created", result.created)
                tokenJs.put("type", result.type)

                call.success(tokenJs)
            }

            override fun onError(e: Exception) {
                call.error("unable to create token: " + e.localizedMessage, e)
            }
        }

        stripeInstance!!.createToken(card, callback)
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

        stripeInstance!!.createBankAccountToken(bankAccount, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val tokenJs = JSObject()

                if (result.bankAccount != null) {
                    val jsObj = bankAccountToJSON(result.bankAccount!!)
                    tokenJs.put("bankAccount", jsObj)
                }

                tokenJs.put("id", result.id)
                tokenJs.put("created", result.created)
                tokenJs.put("type", result.type)

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

        stripeInstance!!.createSource(sourceParams, object : ApiResultCallback<Source> {
            override fun onSuccess(result: Source) {
                val tokenJs = JSObject()
                tokenJs.put("id", result.id)
                tokenJs.put("created", result.created)
                tokenJs.put("type", result.type)
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

        stripeInstance!!.createAccountToken(params, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val res = JSObject()
                res.put("token", result.id)
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
        stripeInstance!!.createPiiToken(pii, object : ApiResultCallback<Token> {
            override fun onSuccess(result: Token) {
                val res = JSObject()
                res.put("token", result.id)
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
            val cb = buildCard(call) // TODO fix this, we need to pass call.getObject(card)xs
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

        stripeInstance!!.confirmPayment(activity, params)
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

        if (call.hasOption("card")) {
            val cb = buildCard(call)
            val cardParams = cb.build().toPaymentMethodParamsCard()
            val pmCreateParams = PaymentMethodCreateParams.create(cardParams)
            params = ConfirmSetupIntentParams.create(pmCreateParams, clientSecret, redirectUrl)
        } else if (call.hasOption("paymentMethodId")) {
            params = ConfirmSetupIntentParams.create(call.getString("paymentMethodId"), clientSecret, redirectUrl)
        } else {
            params = ConfirmSetupIntentParams.createWithoutPaymentMethod(clientSecret, redirectUrl)
        }

        stripeInstance!!.confirmSetupIntent(activity, params)
        saveCall(call)
    }

    @PluginMethod
    fun customizePaymentAuthUI(call: PluginCall) {
        stripeInstance = Stripe(context, "pk_test_wFMKbghjzLxlEDDjnM1aVTzE")
        PaymentConfiguration.init(context, "pk_test_wFMKbghjzLxlEDDjnM1aVTzE")

        val builder = PaymentAuthConfig.Stripe3ds2UiCustomization.Builder()
        builder.setAccentColor("#533094")


        val btnOptsBuilder = PaymentAuthConfig.Stripe3ds2ButtonCustomization.Builder()
                .setBackgroundColor("#533094")
                .setTextColor("#ffffff")
                .setCornerRadius(15)

        builder.setButtonCustomization(btnOptsBuilder.build(), PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.SUBMIT)

        val uiCustomization = builder.build()


        PaymentAuthConfig.init(PaymentAuthConfig.Builder()
                .set3ds2Config(PaymentAuthConfig.Stripe3ds2Config.Builder()
                        .setUiCustomization(uiCustomization)
                        .build())
                .build())

        EphKeyProvider.setKey("{\"id\":\"ephkey_1FbN35HKHDJSZCWCkbW1QKCi\",\"object\":\"ephemeral_key\",\"associated_objects\":[{\"type\":\"customer\",\"id\":\"cus_G6XAH5fZ6dUs77\"}],\"created\":1572941159,\"expires\":1572944759,\"livemode\":false,\"secret\":\"ek_test_YWNjdF8xRFk4eFBIS0hESlNaQ1dDLDNVM2JQekFVS2lVc0VDSDB5aTF5Mm0zZ0ZLUE52WHQ_00f1aV09jb\"}")
        CustomerSession.initCustomerSession(context, EphKeyProvider())
        val cs = CustomerSession.getInstance()


        val ts = ArrayList<PaymentMethod.Type>()
        ts.add(PaymentMethod.Type.Card)
        ts.add(PaymentMethod.Type.Fpx)

        val psc = PaymentSessionConfig.Builder()
                .setShippingMethodsRequired(true)
                .setShippingInfoRequired(true)
                .setPaymentMethodTypes(ts)
                .build()

        val session = PaymentSession(activity)

        session.setCartTotal(555)

        session.init(object : PaymentSession.PaymentSessionListener {
            override fun onCommunicatingStateChanged(isCommunicating: Boolean) {
                Log.d(TAG, "onCommunicatingStateChanged")
            }

            override fun onError(errorCode: Int, errorMessage: String) {
                Log.d(TAG, "onError")
            }

            override fun onPaymentSessionDataChanged(data: PaymentSessionData) {
                Log.d(TAG, "onPaymentSessionDataChanged")
            }
        }, psc)

        session.presentPaymentMethodSelection(true)

        /*
        if (!ensurePluginInitialized(call)) {
            return;
        }

        final PaymentAuthConfig.Stripe3ds2UiCustomization.Builder builder = new PaymentAuthConfig.Stripe3ds2UiCustomization.Builder();

        // TODO add the remaining options here

        String accentColor = call.getString("accentColor");

        if (accentColor != null) {
            builder.setAccentColor(accentColor);
        }

        JSArray btnOpts = call.getArray("buttonCustomizations");

        if (btnOpts != null) {
            try {
                List<JSObject> opts = btnOpts.toList();
                String buttonType;
                String backgroundColor;
                String textColor;
                String fontName;
                Integer cornerRadius;
                Integer fontSize;
                PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType stripeBtnType;
                PaymentAuthConfig.Stripe3ds2ButtonCustomization.Builder btnOptsBuilder;
                PaymentAuthConfig.Stripe3ds2ButtonCustomization stripeBtnOpts;

                for (JSObject opt : opts) {
                    buttonType = opt.getString("type");
                    backgroundColor = opt.getString("backgroundColor");
                    textColor = opt.getString("textColor");
                    fontName = opt.getString("fontName");
                    cornerRadius = opt.getInteger("cornerRadius");
                    fontSize = opt.getInteger("fontSize");

                    switch (buttonType) {
                        case "submit":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.SUBMIT;
                            break;

                        case "continue":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.CONTINUE;
                            break;

                        case "next":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.NEXT;
                            break;

                        case "cancel":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.CANCEL;
                            break;

                        case "resend":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.RESEND;
                            break;

                        case "select":
                            stripeBtnType = PaymentAuthConfig.Stripe3ds2UiCustomization.ButtonType.SELECT;
                            break;

                        default:
                            continue;
                    }

                    btnOptsBuilder = new PaymentAuthConfig.Stripe3ds2ButtonCustomization.Builder();

                    if (backgroundColor != null) {
                        btnOptsBuilder.setBackgroundColor(backgroundColor);
                    }

                    if (cornerRadius != null) {
                        btnOptsBuilder.setCornerRadius(cornerRadius);
                    }

                    if (textColor != null) {
                        btnOptsBuilder.setTextColor(textColor);
                    }

                    if (fontName != null) {
                        btnOptsBuilder.setTextFontName(fontName);
                    }

                    if (fontSize != null) {
                        btnOptsBuilder.setTextFontSize(fontSize);
                    }

                    stripeBtnOpts = btnOptsBuilder.build();

                    builder.setButtonCustomization(stripeBtnOpts, stripeBtnType);
                }
            } catch (Exception e) {
                //
            }
        }


        final PaymentAuthConfig.Stripe3ds2UiCustomization uiCustomization = builder.build();

        PaymentAuthConfig.init(new PaymentAuthConfig.Builder()
                .set3ds2Config(new PaymentAuthConfig.Stripe3ds2Config.Builder()
                        .setTimeout(5)
                        .setUiCustomization(uiCustomization)
                        .build())
                .build());


 */
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
        isReadyToPayRequestJson.put("allowedAuthMethods", allowedAuthMethods)
        isReadyToPayRequestJson.put("allowedCardNetworks", allowedCardNetworks)

        val req = IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString())
        paymentsClient.isReadyToPay(req)
                .addOnCompleteListener { task ->
                    val obj = JSObject()
                    obj.put("available", task.isSuccessful)
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
                billingAddressParams.put("format", "MIN")
            }

            if (!billingAddressParams.has("phoneNumberRequired")) {
                billingAddressParams.put("phoneNumberRequired", false)
            }

            val shippingAddressParams = call.getObject("shippingAddressParameters", JSObject())

            val params = JSObject()
                    .put("allowedAuthMethods", authMethods)
                    .put("allowedCardNetworks", cardNetworks)
                    .put("billingAddressRequired", billingAddressRequired)
                    .put("allowPrepaidCards", allowPrepaidCards)
                    .put("billingAddressParameters", billingAddressParams)

            val tokenizationSpec = GooglePayConfig(publishableKey!!).tokenizationSpecification

            val cardPaymentMethod = JSObject()
                    .put("type", "CARD")
                    .put("parameters", params)
                    .put("tokenizationSpecification", tokenizationSpec)

            val txInfo = JSObject()
            txInfo.put("totalPrice", totalPrice)
            txInfo.put("totalPriceStatus", totalPriceStatus)
            txInfo.put("currencyCode", currencyCode)

            val paymentDataReq = JSObject()
                    .put("apiVersion", 2)
                    .put("apiVersionMinor", 0)
                    .put("allowedPaymentMethods", JSArray().put(cardPaymentMethod))
                    .put("transactionInfo", txInfo)
                    .put("emailRequired", emailRequired)

            if (merchantName != null) {
                paymentDataReq.put("merchantInfo", JSObject().put("merchantName", merchantName))
            }

            if (shippingAddressRequired!!) {
                paymentDataReq.put("shippingAddressRequired", true)
                paymentDataReq.put("shippingAddressParameters", shippingAddressParams)
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

        val ephKey = call.getString("key")
        EphKeyProvider.setKey(ephKey)
        CustomerSession.initCustomerSession(context, EphKeyProvider())
        call.resolve()
    }

    @PluginMethod
    fun onPaymentSessionDataChanged(call: PluginCall) {
        if (!ensurePluginInitialized(call)) {
            return
        }

        call.save()
    }

    /**
     * Ensures that setPublishableKey was called and stripeInstance exists.
     * Rejects the call with an error and returns false if the plugin is not ready.
     *
     * @param call {PluginCall} current method call
     * @return {boolean} returns true if the plugin is ready
     */
    private fun ensurePluginInitialized(call: PluginCall): Boolean {
        if (stripeInstance == null) {
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
                    obj.put("canceled", status.isCanceled)
                    obj.put("interrupted", status.isInterrupted)
                    obj.put("success", status.isSuccess)
                    obj.put("code", status.statusCode)
                    obj.put("message", status.statusMessage)
                    obj.put("resolution", status.resolution)
                } else {
                    obj.put("canceled", true)
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

        stripeInstance!!.onPaymentResult(requestCode, data, object : ApiResultCallback<PaymentIntentResult> {
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

        stripeInstance!!.onSetupResult(requestCode, data, object : ApiResultCallback<SetupIntentResult> {
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

    companion object {
        private val LOAD_PAYMENT_DATA_REQUEST_CODE = 9972
        private val TAG = "Capacitor:StripePlugin"

        private fun buildCard(call: PluginCall): Card.Builder {
            val builder = Card.Builder(
                    call.getString("number"),
                    call.getInt("exp_month"),
                    call.getInt("exp_year"),
                    call.getString("cvc")
            )

            return builder
                    .name(call.getString("value"))
                    .addressLine1(call.getString("address_line1"))
                    .addressLine2(call.getString("address_line2"))
                    .addressCity(call.getString("address_city"))
                    .addressState(call.getString("address_state"))
                    .addressZip(call.getString("address_zip"))
                    .country(call.getString("address_country"))
                    .currency(call.getString("currency"))
        }

        private fun cardToJSON(card: Card): JSObject {
            val cardJs = JSObject()
            cardJs.put("address_city", card.addressCity)
            cardJs.put("address_country", card.addressCountry)
            cardJs.put("address_state", card.addressState)
            cardJs.put("address_line1", card.addressLine1)
            cardJs.put("address_line2", card.addressLine2)
            cardJs.put("address_zip", card.addressZip)
            cardJs.put("brand", card.brand)
            cardJs.put("country", card.addressCountry)
            cardJs.put("cvc", card.cvc)
            cardJs.put("exp_month", card.expMonth)
            cardJs.put("exp_year", card.expYear)
            cardJs.put("funding", card.funding)
            cardJs.put("last4", card.last4)
            cardJs.put("name", card.name)
            return cardJs
        }

        private fun bankAccountToJSON(account: BankAccount): JSObject {
            val bankObject = JSObject()

            bankObject.put("account_holder_name", account.accountHolderName)
            bankObject.put("account_holder_type", account.accountHolderType)
            bankObject.put("bank_name", account.bankName)
            bankObject.put("country", account.countryCode)
            bankObject.put("currency", account.currency)
            bankObject.put("last4", account.last4)
            bankObject.put("routing_number", account.routingNumber)

            return bankObject
        }

        private fun setupIntentToJSON(si: SetupIntent): JSObject {
            val res = JSObject()

            res.put("status", si.status)
            res.put("paymentMethodId", si.paymentMethodId)
            res.put("cancellationReason", si.cancellationReason)
            res.put("created", si.created)
            res.put("description", si.description)
            res.put("id", si.id)
            res.put("isLiveMode", si.isLiveMode)

            val u = si.usage

            if (u != null) {
                res.put("usage", u.code)
            }

            return res
        }

        private fun paymentIntentToJSON(pi: PaymentIntent): JSObject {
            val res = JSObject()
            val status = pi.status

            res.put("status", status)
            res.put("amount", pi.amount)
            res.put("canceledAt", pi.canceledAt)
            res.put("cancellationReason", pi.cancellationReason)
            res.put("captureMethod", pi.captureMethod)
            res.put("confirmationMethod", pi.confirmationMethod)
            res.put("created", pi.created)
            res.put("currency", pi.currency)
            res.put("description", pi.description)
            res.put("id", pi.id)
            res.put("lastPaymentError", pi.lastPaymentError)
            res.put("paymentMethodId", pi.paymentMethodId)
            res.put("isLiveMode", pi.isLiveMode)

            // TODO confirm whether we really need to check this since the SDK handles action/confirmation automatically
            res.put("success", status == StripeIntent.Status.Succeeded)
            res.put("requiresAction", pi.requiresAction())
            res.put("requiresConfirmation", pi.requiresConfirmation())

            return res
        }

        private fun jsonToHashMap(obj: JSONObject?): HashMap<String, Any> {
            if (obj != null && obj.length() > 0) {
                val type = object : TypeToken<HashMap<String, Any>>() {

                }.type
                return Gson().fromJson(obj.toString(), type)
            } else {
                return HashMap()
            }
        }
    }
}
