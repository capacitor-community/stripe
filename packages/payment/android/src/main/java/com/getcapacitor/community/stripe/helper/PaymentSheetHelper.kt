package com.getcapacitor.community.stripe.helper

import com.getcapacitor.JSObject
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.addresselement.AddressDetails
import com.stripe.android.paymentsheet.PaymentSheet.BillingDetailsCollectionConfiguration
import com.stripe.android.paymentsheet.PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode
import com.stripe.android.paymentsheet.PaymentSheet.BillingDetailsCollectionConfiguration.AddressCollectionMode

class PaymentSheetHelper {
    fun fromJSObjectToBillingDetails(obj: JSObject?): PaymentSheet.BillingDetails {
        if (obj == null) return PaymentSheet.BillingDetails()
        val address = fromJSObjectToAddress(obj.getJSObject("address", null))
        return PaymentSheet.BillingDetails(
            address = address,
            email = obj.getString("email", null),
            name = obj.getString("name", null),
            phone = obj.getString("phone", null)
        )
    }

    fun fromJSObjectToShippingDetails(obj: JSObject?): AddressDetails? {
        if (obj == null) return null
        val address = fromJSObjectToAddress(obj.getJSObject("address", null))
        return AddressDetails(
            name = obj.getString("name", null),
            address = address,
            phoneNumber = obj.getString("phone", null),
            isCheckboxSelected = obj.getBoolean("isCheckboxSelected", false)
        )
    }

    fun fromJSObjectToBillingCollectionConfig(obj: JSObject?): BillingDetailsCollectionConfiguration {
        if (obj == null) return BillingDetailsCollectionConfiguration()

        val name = parseCollectionMode(obj.getString("name"))
        val phone = parseCollectionMode(obj.getString("phone"))
        val email = parseCollectionMode(obj.getString("email"))
        val address = parseAddressCollectionMode(obj.getString("address"))

        return BillingDetailsCollectionConfiguration(
            name = name,
            phone = phone,
            email = email,
            address = address,
            attachDefaultsToPaymentMethod = false
        )
    }

    private fun fromJSObjectToAddress(obj: JSObject?): PaymentSheet.Address {
        if (obj == null) return PaymentSheet.Address()
        return PaymentSheet.Address(
            country = obj.getString("country", null),
            city = obj.getString("city", null),
            line1 = obj.getString("line1", null),
            line2 = obj.getString("line2", null),
            postalCode = obj.getString("postalCode", null),
            state = obj.getString("state", null)
        )
    }

    private fun parseCollectionMode(mode: String?): CollectionMode = when (mode) {
        "always" -> CollectionMode.Always
        "never" -> CollectionMode.Never
        else -> CollectionMode.Automatic
    }

    private fun parseAddressCollectionMode(mode: String?): AddressCollectionMode = when (mode) {
        "full" -> AddressCollectionMode.Full
        "never" -> AddressCollectionMode.Never
        else -> AddressCollectionMode.Automatic
    }
}