package ca.zyra.capacitor.stripe

import com.getcapacitor.JSObject
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.stripe.android.model.*
import org.json.JSONObject
import java.util.*

internal const val LOAD_PAYMENT_DATA_REQUEST_CODE = 9972
internal const val STRIPE_PAYMENT_METHODS_REQ_CODE = 6000
internal const val STRIPE_GOOGLE_PAY_REQUEST_CODE = 50000
internal const val TAG = "Capacitor:StripePlugin"
internal const val ERR_NO_ACTIVE_CUSTOMER_SESSION = "No active customer session was found. You must create one by calling initCustomerSession."
internal const val ERR_STRIPE_NOT_INITIALIZED = "This method requires authenticated access to the Stripe client. You must initialize it by calling setPublishableKey with a valid key."

internal fun buildCard(call: JSONObject): Card.Builder {
    val builder = Card.Builder(
            call.optString("number"),
            call.optInt("exp_month"),
            call.optInt("exp_year"),
            call.optString("cvc")
    )

    return builder
            .name(call.optString("name"))
            .addressLine1(call.optString("address_line1"))
            .addressLine2(call.optString("address_line2"))
            .addressCity(call.optString("address_city"))
            .addressState(call.optString("address_state"))
            .addressZip(call.optString("address_zip"))
            .addressCountry(call.optString("address_country"))
            .currency(call.optString("currency"))
            .addressCountry(call.optString("country"))
}

internal fun cardToJSON(card: Card): JSObject {
    card.toPaymentMethodParamsCard()

    val cardJs = JSObject()
    cardJs.putOpt("address_city", card.addressCity)
    cardJs.putOpt("address_country", card.addressCountry)
    cardJs.putOpt("address_state", card.addressState)
    cardJs.putOpt("address_line1", card.addressLine1)
    cardJs.putOpt("address_line2", card.addressLine2)
    cardJs.putOpt("address_zip", card.addressZip)
    cardJs.putOpt("brand", card.brand)
    cardJs.putOpt("country", card.addressCountry)
    cardJs.putOpt("cvc", card.cvc)
    cardJs.putOpt("exp_month", card.expMonth)
    cardJs.putOpt("exp_year", card.expYear)
    cardJs.putOpt("funding", card.funding)
    cardJs.putOpt("last4", card.last4)
    cardJs.putOpt("name", card.name)
    return cardJs
}

internal fun bankAccountToJSON(a: BankAccount): JSObject {
    val obj = JSObject()

    obj.putOpt("account_holder_name", a.accountHolderName)
    obj.putOpt("account_holder_type", a.accountHolderType)
    obj.putOpt("bank_name", a.bankName)
    obj.putOpt("country", a.countryCode)
    obj.putOpt("currency", a.currency)
    obj.putOpt("last4", a.last4)
    obj.putOpt("routing_number", a.routingNumber)
    obj.putOpt("id", a.id)
    obj.putOpt("object", "bank_account")
    obj.putOpt("status", a.status.toString())

    return obj
}

internal fun setupIntentToJSON(si: SetupIntent): JSObject {
    val res = JSObject()

    res.putOpt("status", si.status)
    res.putOpt("paymentMethodId", si.paymentMethodId)
    res.putOpt("cancellationReason", si.cancellationReason)
    res.putOpt("created", si.created)
    res.putOpt("description", si.description)
    res.putOpt("id", si.id)
    res.putOpt("isLiveMode", si.isLiveMode)
    res.putOpt("usage", si.usage?.code)

    return res
}

internal fun paymentIntentToJSON(pi: PaymentIntent): JSObject {
    val res = JSObject()
    val status = pi.status

    res.putOpt("status", status)
    res.putOpt("amount", pi.amount)
    res.putOpt("canceledAt", pi.canceledAt)
    res.putOpt("cancellationReason", pi.cancellationReason)
    res.putOpt("captureMethod", pi.captureMethod)
    res.putOpt("confirmationMethod", pi.confirmationMethod)
    res.putOpt("created", pi.created)
    res.putOpt("currency", pi.currency)
    res.putOpt("description", pi.description)
    res.putOpt("id", pi.id)
    res.putOpt("lastPaymentError", pi.lastPaymentError)
    res.putOpt("paymentMethodId", pi.paymentMethodId)
    res.putOpt("isLiveMode", pi.isLiveMode)

    // TODO confirm whether we really need to check this since the SDK handles action/confirmation automatically
    res.putOpt("success", status == StripeIntent.Status.Succeeded)
    res.putOpt("requiresAction", pi.requiresAction())
    res.putOpt("requiresConfirmation", pi.requiresConfirmation())

    return res
}

internal fun jsonToHashMap(obj: JSONObject?): HashMap<String, Any> {
    when (obj != null && obj.length() > 0) {
        true -> return Gson().fromJson(obj.toString(), object : TypeToken<HashMap<String, Any>>() {

        }.type)

        false -> return HashMap()
    }
}

internal fun pmToJson(pm: PaymentMethod): JSObject {
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
        co.putOpt("country", c.country)
        co.putOpt("exp_month", c.expiryMonth)
        co.putOpt("exp_year", c.expiryYear)
        co.putOpt("funding", c.funding)
        co.putOpt("last4", c.last4)

        if (c.threeDSecureUsage != null) {
            co.put("three_d_secure_usage", JSObject().putOpt("supported", c.threeDSecureUsage!!.isSupported))
        }

        obj.put("card", co)
    }
    return obj
}