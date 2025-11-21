package com.getcapacitor.community.stripe.paymentsheet

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.Bridge
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.community.stripe.helper.PaymentSheetHelper
import com.getcapacitor.community.stripe.models.Executor
import com.google.android.gms.common.util.BiConsumer
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

class PaymentSheetExecutor(
    contextSupplier: Supplier<Context>,
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
    private var configurationBuilder: PaymentSheet.Configuration.Builder? = null
    private val emptyObject = JSObject()

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

        val paymentMethodLayout: PaymentSheet.PaymentMethodLayout = when (call.getString("paymentMethodLayout", "automatic")) {
            "horizontal" -> PaymentSheet.PaymentMethodLayout.Horizontal
            "vertical"   -> PaymentSheet.PaymentMethodLayout.Vertical
            "automatic"  -> PaymentSheet.PaymentMethodLayout.Automatic
            else         -> PaymentSheet.PaymentMethodLayout.Automatic
        }

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


        val defaultBillingDetailsConfiguration = PaymentSheetHelper().fromJSObjectToBillingDetails(call.getObject("defaultBillingDetails", null))
        val shippingDetailsConfiguration = PaymentSheetHelper().fromJSObjectToShippingDetails(call.getObject("shippingDetails", null));
        val billingDetailsCollectionConfiguration = PaymentSheetHelper().fromJSObjectToBillingCollectionConfig(
            call.getObject("billingDetailsCollectionConfiguration", null)
        )

        configurationBuilder = PaymentSheet.Configuration.Builder(merchantDisplayName)
            .customer(customer)
            .defaultBillingDetails(defaultBillingDetailsConfiguration)
            .shippingDetails(shippingDetailsConfiguration)
            .billingDetailsCollectionConfiguration(billingDetailsCollectionConfiguration)
            .paymentMethodLayout(paymentMethodLayout)

        if (enableGooglePay!!) {
            val googlePayEnvironment = call.getBoolean("GooglePayIsTesting", false)!!

            var environment: PaymentSheet.GooglePayConfiguration.Environment =
                PaymentSheet.GooglePayConfiguration.Environment.Production

            if (googlePayEnvironment) {
                environment = PaymentSheet.GooglePayConfiguration.Environment.Test
            }

            configurationBuilder!!.googlePay(PaymentSheet.GooglePayConfiguration(
                    environment,
                    call.getString("countryCode", "US")!!,
                    call.getString("currencyCode", null)
                ))
        }

        notifyListenersFunction.accept(PaymentSheetEvents.Loaded.webEventName, emptyObject)
        call.resolve()
    }

    fun presentPaymentSheet(call: PluginCall) {
        try {
            if (paymentIntentClientSecret != null) {
                paymentSheet!!.presentWithPaymentIntent(
                    paymentIntentClientSecret!!,
                    configurationBuilder!!.build()
                )
            } else {
                paymentSheet!!.presentWithSetupIntent(
                    setupIntentClientSecret!!,
                    configurationBuilder!!.build()
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
                    (paymentSheetResult).error.localizedMessage
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
