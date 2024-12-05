package com.getcapacitor.community.stripe.paymentsheet

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.Bridge
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.community.stripe.models.Executor
import com.google.android.gms.common.util.BiConsumer
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheet.BillingDetailsCollectionConfiguration.AddressCollectionMode
import com.stripe.android.paymentsheet.PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode
import com.stripe.android.paymentsheet.PaymentSheetResult

class PaymentSheetExecutor(
    contextSupplier: Supplier<Context?>,
    activitySupplier: Supplier<Activity>,
    notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String
) : Executor(
    contextSupplier,
    activitySupplier,
    notifyListenersFunction,
    pluginLogTag,
    "PaymentSheetExecutor"
) {
    var paymentSheet: PaymentSheet? = null
    private val emptyObject = JSObject()
    private var paymentConfiguration: PaymentSheet.Configuration? = null

    private var paymentIntentClientSecret: String? = null
    private var setupIntentClientSecret: String? = null

    init {
        this.contextSupplier = contextSupplier
    }

    fun createPaymentSheet(call: PluginCall) {
        paymentIntentClientSecret = call.getString("paymentIntentClientSecret", null)
        setupIntentClientSecret = call.getString("setupIntentClientSecret", null)

        val customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret", null)
        val customerId = call.getString("customerId", null)

        if (paymentIntentClientSecret == null && setupIntentClientSecret == null) {
            val errorText =
                "Invalid Params. This method require paymentIntentClientSecret or setupIntentClientSecret."
            notifyListenersFunction.accept(
                PaymentSheetEvents.FailedToLoad.webEventName,
                JSObject().put("error", errorText)
            )
            call.reject(errorText)
            return
        }

        if (customerId != null && customerEphemeralKeySecret == null) {
            val errorText =
                "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret."
            notifyListenersFunction.accept(
                PaymentSheetEvents.FailedToLoad.webEventName,
                JSObject().put("error", errorText)
            )
            call.reject(errorText)
            return
        }

        var merchantDisplayName = call.getString("merchantDisplayName")

        if (merchantDisplayName == null) {
            merchantDisplayName = ""
        }

        val enableGooglePay = call.getBoolean("enableGooglePay", false)

        val customer: PaymentSheet.CustomerConfiguration? = if (customerId != null
        ) PaymentSheet.CustomerConfiguration(customerId, customerEphemeralKeySecret!!)
        else null

        var billingDetailsCollectionConfiguration: PaymentSheet.BillingDetailsCollectionConfiguration? = null
        val bdCollectionConfiguration =
            call.getObject("billingDetailsCollectionConfiguration", null)
        if (bdCollectionConfiguration != null) {
            val emailCollectionMode = bdCollectionConfiguration.getString("email")
            val nameCollectionMode = bdCollectionConfiguration.getString("name")
            val phoneCollectionMode = bdCollectionConfiguration.getString("phone")
            val addressCollectionMode = bdCollectionConfiguration.getString("address")
            billingDetailsCollectionConfiguration =
                PaymentSheet.BillingDetailsCollectionConfiguration(
                    if ((nameCollectionMode != null && nameCollectionMode == "always")
                    ) CollectionMode.Always else CollectionMode.Automatic,
                    if ((phoneCollectionMode != null && phoneCollectionMode == "always")
                    ) CollectionMode.Always else CollectionMode.Automatic,
                    if ((emailCollectionMode != null && emailCollectionMode == "always")
                    ) CollectionMode.Always else CollectionMode.Automatic,
                    if ((addressCollectionMode != null && addressCollectionMode == "full")
                    ) AddressCollectionMode.Full else AddressCollectionMode.Automatic,
                    false
                )
        }

        if (!enableGooglePay!!) {
            paymentConfiguration = if (bdCollectionConfiguration != null) {
                PaymentSheet.Configuration(
                    merchantDisplayName,
                    customer,
                    billingDetailsCollectionConfiguration = billingDetailsCollectionConfiguration!!
                )
            } else {
                PaymentSheet.Configuration(
                    merchantDisplayName,
                    customer,
                )
            }
        } else {
            val GooglePayEnvironment = call.getBoolean("GooglePayIsTesting", false)

            var environment: PaymentSheet.GooglePayConfiguration.Environment =
                PaymentSheet.GooglePayConfiguration.Environment.Production

            if (GooglePayEnvironment!!) {
                environment = PaymentSheet.GooglePayConfiguration.Environment.Test
            }

            paymentConfiguration = if (bdCollectionConfiguration != null) {
                PaymentSheet.Configuration(
                    merchantDisplayName,
                    customer,
                    billingDetailsCollectionConfiguration = billingDetailsCollectionConfiguration!!,
                    googlePay = PaymentSheet.GooglePayConfiguration(
                        environment,
                        call.getString("countryCode", "US")!!
                    ),
                )
            } else {
                PaymentSheet.Configuration(
                    merchantDisplayName,
                    customer,
                    googlePay = PaymentSheet.GooglePayConfiguration(
                        environment,
                        call.getString("countryCode", "US")!!
                    ),
                )
            }
        }

        notifyListenersFunction.accept(PaymentSheetEvents.Loaded.webEventName, emptyObject)
        call.resolve()
    }

    fun presentPaymentSheet(call: PluginCall) {
        try {
            if (paymentIntentClientSecret != null) {
                paymentSheet!!.presentWithPaymentIntent(
                    paymentIntentClientSecret!!,
                    paymentConfiguration
                )
            } else {
                paymentSheet!!.presentWithSetupIntent(
                    setupIntentClientSecret!!,
                    paymentConfiguration
                )
            }
        } catch (ex: Exception) {
            call.reject(ex.localizedMessage, ex)
        }
    }

    fun onPaymentSheetResult(
        bridge: Bridge,
        callbackId: String?,
        paymentSheetResult: PaymentSheetResult
    ) {
        val call = bridge.getSavedCall(callbackId)

        if (paymentSheetResult is PaymentSheetResult.Canceled) {
            notifyListenersFunction.accept(PaymentSheetEvents.Canceled.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", PaymentSheetEvents.Canceled.webEventName))
        } else if (paymentSheetResult is PaymentSheetResult.Failed) {
            notifyListenersFunction.accept(
                PaymentSheetEvents.Failed.webEventName,
                JSObject().put(
                    "message",
                    (paymentSheetResult as PaymentSheetResult.Failed).error.getLocalizedMessage()
                )
            )
            notifyListenersFunction.accept(PaymentSheetEvents.Failed.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", PaymentSheetEvents.Failed.webEventName))
        } else if (paymentSheetResult is PaymentSheetResult.Completed) {
            notifyListenersFunction.accept(PaymentSheetEvents.Completed.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", PaymentSheetEvents.Completed.webEventName))
        }
    }
}
