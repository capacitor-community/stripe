package ca.zyra.capacitor.stripe

import com.getcapacitor.JSObject
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.stripe.android.model.*
import org.json.JSONObject
import java.util.*

internal const val LOAD_PAYMENT_DATA_REQUEST_CODE = 9972
internal const val STRIPE_GOOGLE_PAY_REQUEST_CODE = 50000
internal const val TAG = "Capacitor:StripePlugin"

internal fun buildCard(call: JSObject): Card.Builder {
    val builder = Card.Builder(
            call.optString("number"),
            call.optInt("exp_month"),
            call.optInt("exp_year"),
            call.optString("cvc")
    )

    return builder
            .name(call.optString("value"))
            .addressLine1(call.optString("address_line1"))
            .addressLine2(call.optString("address_line2"))
            .addressCity(call.optString("address_city"))
            .addressState(call.optString("address_state"))
            .addressZip(call.optString("address_zip"))
            .country(call.optString("address_country"))
            .currency(call.optString("currency"))
}

internal fun cardToJSON(card: Card): JSObject {
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

internal fun bankAccountToJSON(account: BankAccount): JSObject {
    val bankObject = JSObject()

    bankObject.putOpt("account_holder_name", account.accountHolderName)
    bankObject.putOpt("account_holder_type", account.accountHolderType)
    bankObject.putOpt("bank_name", account.bankName)
    bankObject.putOpt("country", account.countryCode)
    bankObject.putOpt("currency", account.currency)
    bankObject.putOpt("last4", account.last4)
    bankObject.putOpt("routing_number", account.routingNumber)

    return bankObject
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