package com.getcapacitor.community.stripe.paymentflow

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
import com.stripe.android.paymentsheet.PaymentSheet.PaymentMethodLayout
import com.stripe.android.paymentsheet.PaymentSheetResult
import com.stripe.android.paymentsheet.model.PaymentOption

class PaymentFlowExecutor(
    contextSupplier: Supplier<Context>,
    activitySupplier: Supplier<Activity>,
    notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String
) : Executor(
    contextSupplier,
    activitySupplier,
    notifyListenersFunction,
    pluginLogTag,
    "PaymentFlowExecutor"
) {
    var flowController: PaymentSheet.FlowController? = null
    private var configurationBuilder: PaymentSheet.Configuration.Builder? = null
    private val emptyObject = JSObject()

    init {
        this.contextSupplier = contextSupplier
    }

    fun createPaymentFlow(call: PluginCall) {
        val paymentIntentClientSecret = call.getString("paymentIntentClientSecret", null)
        val setupIntentClientSecret = call.getString("setupIntentClientSecret", null)
        val customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret", null)
        val customerId = call.getString("customerId", null)

        val paymentMethodLayout: PaymentMethodLayout = when (call.getString("paymentMethodLayout", "automatic")) {
            "horizontal" -> PaymentMethodLayout.Horizontal
            "vertical"   -> PaymentMethodLayout.Vertical
            "automatic"  -> PaymentMethodLayout.Automatic
            else         -> PaymentMethodLayout.Automatic
        }

        if (paymentIntentClientSecret == null && setupIntentClientSecret == null) {
            val errorText =
                "Invalid Params. This method require paymentIntentClientSecret or setupIntentClientSecret."
            notifyListenersFunction.accept(
                PaymentFlowEvents.FailedToLoad.webEventName,
                JSObject().put("error", errorText)
            )
            call.reject(errorText)
            return
        }

        if (customerId != null && customerEphemeralKeySecret == null) {
            val errorText =
                "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret."
            notifyListenersFunction.accept(
                PaymentFlowEvents.FailedToLoad.webEventName,
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

        if (setupIntentClientSecret != null) {
            flowController!!.configureWithSetupIntent(
                setupIntentClientSecret,
                configurationBuilder!!.build()
            ) { success: Boolean, error: Throwable? ->
                if (success) {
                    notifyListenersFunction.accept(
                        PaymentFlowEvents.Loaded.webEventName,
                        emptyObject
                    )
                    call.resolve()
                } else {
                    notifyListenersFunction.accept(
                        PaymentFlowEvents.FailedToLoad.webEventName,
                        JSObject().put("error", error!!.localizedMessage)
                    )
                    call.reject(error.localizedMessage)
                }
            }
        } else if (paymentIntentClientSecret != null) {
            flowController!!.configureWithPaymentIntent(
                paymentIntentClientSecret,
                configurationBuilder!!.build()
            ) { success: Boolean, error: Throwable? ->
                if (success) {
                    notifyListenersFunction.accept(
                        PaymentFlowEvents.Loaded.webEventName,
                        emptyObject
                    )
                    call.resolve()
                } else {
                    notifyListenersFunction.accept(
                        PaymentFlowEvents.FailedToLoad.webEventName,
                        JSObject().put("error", error!!.localizedMessage)
                    )
                    call.reject(error.localizedMessage)
                }
            }
        }
    }

    fun presentPaymentFlow(call: PluginCall) {
        try {
            notifyListenersFunction.accept(PaymentFlowEvents.Opened.webEventName, emptyObject)
            flowController!!.presentPaymentOptions()
        } catch (ex: Exception) {
            call.reject(ex.localizedMessage, ex)
        }
    }

    fun confirmPaymentFlow(call: PluginCall) {
        try {
            flowController!!.confirm()
        } catch (ex: Exception) {
            call.reject(ex.localizedMessage, ex)
        }
    }

    fun onPaymentOption(bridge: Bridge, callbackId: String?, paymentOption: PaymentOption?) {
        val call = bridge.getSavedCall(callbackId)
        if (paymentOption != null) {
            notifyListenersFunction.accept(
                PaymentFlowEvents.Created.webEventName,
                JSObject().put("cardNumber", paymentOption.label)
            )
            call.resolve(JSObject().put("cardNumber", paymentOption.label))
        } else {
            notifyListenersFunction.accept(PaymentFlowEvents.Canceled.webEventName, emptyObject)
            call.reject("User close PaymentFlow Sheet")
        }
    }

    fun onPaymentFlowResult(
        bridge: Bridge,
        callbackId: String?,
        paymentSheetResult: PaymentSheetResult
    ) {
        val call = bridge.getSavedCall(callbackId)

        if (paymentSheetResult is PaymentSheetResult.Canceled) {
            notifyListenersFunction.accept(PaymentFlowEvents.Canceled.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", PaymentFlowEvents.Canceled.webEventName))
        } else if (paymentSheetResult is PaymentSheetResult.Failed) {
            notifyListenersFunction.accept(
                PaymentFlowEvents.Failed.webEventName,
                JSObject().put("error", (paymentSheetResult).error.localizedMessage)
            )
            call.resolve(JSObject().put("paymentResult", PaymentFlowEvents.Failed.webEventName))
        } else if (paymentSheetResult is PaymentSheetResult.Completed) {
            notifyListenersFunction.accept(PaymentFlowEvents.Completed.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", PaymentFlowEvents.Completed.webEventName))
        }
    }
}
