package ca.zyra.capacitor.stripe

import android.content.Context
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.google.android.gms.wallet.IsReadyToPayRequest
import com.google.android.gms.wallet.PaymentsClient
import com.google.android.gms.wallet.Wallet
import com.google.android.gms.wallet.WalletConstants
import com.stripe.android.GooglePayConfig
import org.json.JSONObject

internal fun GetGooglePayEnv(isTest: Boolean): Int {
    return if (isTest) {
        WalletConstants.ENVIRONMENT_TEST
    } else {
        WalletConstants.ENVIRONMENT_PRODUCTION
    }
}

internal fun GooglePayPaymentsClient(context: Context, env: Int): PaymentsClient {
    return Wallet.getPaymentsClient(
            context,
            Wallet.WalletOptions.Builder()
                    .setEnvironment(env)
                    .build()
    )
}

internal fun GooglePayDummyRequest(): IsReadyToPayRequest {
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

    return IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString())
}

internal fun GooglePayCardParams(opts: JSObject): JSONObject {
    val authMethods = opts.getJSONArray("allowedAuthMethods")
    val cardNetworks = opts.getJSONArray("allowedCardNetworks")
    val allowPrepaidCards = opts.getBoolean("allowPrepaidCards", true)
    val billingAddressRequired = opts.getBoolean("billingAddressRequired", false)
    val billingAddressParams = opts.getJSObject("billingAddressParameters", JSObject())

    return JSObject()
            .putOpt("allowedAuthMethods", authMethods)
            .putOpt("allowedCardNetworks", cardNetworks)
            .putOpt("allowPrepaidCards", allowPrepaidCards)
            .putOpt("billingAddressRequired", billingAddressRequired)
            .putOpt("billingAddressParameters", billingAddressParams)
}

internal fun GooglePayTxInfo(opts: JSObject): JSONObject {
    val currencyCode = opts.getString("currencyCode")
    val countryCode = opts.getString("countryCode")
    val transactionId = opts.getString("transactionId")
    val totalPriceStatus = opts.getString("totalPriceStatus")
    val totalPrice = opts.getString("totalPrice")
    val totalPriceLabel = opts.getString("totalPriceLabel")
    val checkoutOption = opts.getString("checkoutOption")

    return JSObject()
            .putOpt("currencyCode", currencyCode)
            .putOpt("countryCode", countryCode)
            .putOpt("transactionId", transactionId)
            .putOpt("totalPriceStatus", totalPriceStatus)
            .putOpt("totalPrice", totalPrice)
            .putOpt("totalPriceLabel", totalPriceLabel)
            .putOpt("checkoutOption", checkoutOption)
}

internal fun GooglePayCardPaymentMethod(publishableKey: String, opts: JSObject): JSONObject {
    val params = GooglePayCardParams(opts)
    val tokenizationSpec = GooglePayConfig(publishableKey).tokenizationSpecification

    return JSObject()
            .putOpt("type", "CARD")
            .putOpt("parameters", params)
            .putOpt("tokenizationSpecification", tokenizationSpec)
}

internal fun GooglePayDataReq(publishableKey: String, opts: JSObject): String {
    val txInfo = GooglePayTxInfo(opts)
    val emailRequired = opts.getBoolean("emailRequired", false)
    val merchantName = opts.getString("merchantName")
    val cardPaymentMethod = GooglePayCardPaymentMethod(publishableKey, opts)

    val req = JSObject()
            .putOpt("apiVersion", 2)
            .putOpt("apiVersionMinor", 0)
            .putOpt("allowedPaymentMethods", JSArray().put(cardPaymentMethod))
            .putOpt("transactionInfo", txInfo)
            .putOpt("emailRequired", emailRequired)

    if (merchantName != null && merchantName.isNotEmpty()) {
        req.putOpt(
                "merchantInfo",
                JSObject().putOpt("merchantName", merchantName)
        )
    }

    val shippingAddressRequired = opts.getBoolean("shippingAddressRequired", false)

    if (shippingAddressRequired!!) {
        val shippingAddressParams = opts.getJSObject(
                "shippingAddressParameters",
                JSObject()
        )

        req
                .putOpt("shippingAddressRequired", true)
                .putOpt("shippingAddressParameters", shippingAddressParams)
    }

    return req.toString()
}
