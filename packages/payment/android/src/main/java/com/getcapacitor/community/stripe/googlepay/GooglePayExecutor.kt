package com.getcapacitor.community.stripe.googlepay

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.Bridge
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.community.stripe.models.Executor
import com.google.android.gms.common.util.BiConsumer
import com.stripe.android.googlepaylauncher.GooglePayLauncher

class GooglePayExecutor(
    contextSupplier: Supplier<Context>,
    activitySupplier: Supplier<Activity>,
    notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String
) : Executor(
    contextSupplier,
    activitySupplier,
    notifyListenersFunction,
    pluginLogTag,
    "GooglePayExecutor"
) {
    var googlePayLauncher: GooglePayLauncher? = null
    private val emptyObject = JSObject()
    private var clientSecret: String? = null
    private var currency: String? = null
    var isAvailable: Boolean = false

    init {
        this.contextSupplier = contextSupplier
    }

    fun isGooglePayAvailable(call: PluginCall) {
        if (isAvailable) {
            call.resolve()
        } else {
            call.unimplemented("Not implemented on Device.")
        }
    }

    fun createGooglePay(call: PluginCall) {
        this.clientSecret = call.getString("paymentIntentClientSecret")
        this.currency = call.getString("currency", "USD")

        if (this.clientSecret == null) {
            val errorText =
                "Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret, and customerId."
            notifyListenersFunction.accept(
                GooglePayEvents.FailedToLoad.webEventName,
                JSObject().put("error", errorText)
            )
            call.reject(errorText)
            return
        }

        notifyListenersFunction.accept(GooglePayEvents.Loaded.webEventName, emptyObject)
        call.resolve()
    }

    fun presentGooglePay(call: PluginCall?) {
        if (this.clientSecret != null && clientSecret!!.startsWith("seti_")) {
            googlePayLauncher!!.presentForSetupIntent(clientSecret!!, currency!!)
        } else {
            googlePayLauncher!!.presentForPaymentIntent(clientSecret!!)
        }
    }

    fun onGooglePayResult(bridge: Bridge, callbackId: String?, result: GooglePayLauncher.Result) {
        val call = bridge.getSavedCall(callbackId)

        if (result is GooglePayLauncher.Result.Completed) {
            notifyListenersFunction.accept(GooglePayEvents.Completed.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", GooglePayEvents.Completed.webEventName))
        } else if (result is GooglePayLauncher.Result.Canceled) {
            notifyListenersFunction.accept(GooglePayEvents.Canceled.webEventName, emptyObject)
            call.resolve(JSObject().put("paymentResult", GooglePayEvents.Canceled.webEventName))
        } else if (result is GooglePayLauncher.Result.Failed) {
            notifyListenersFunction.accept(
                GooglePayEvents.Failed.webEventName,
                JSObject().put("error", (result.error.localizedMessage))
            )
            call.resolve(JSObject().put("paymentResult", GooglePayEvents.Failed.webEventName))
        }
    }
}
