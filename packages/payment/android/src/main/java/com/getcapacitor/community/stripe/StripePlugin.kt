package com.getcapacitor.community.stripe

import android.content.ContentResolver
import android.net.Uri
import com.getcapacitor.JSObject
import com.getcapacitor.Logger
import com.getcapacitor.NativePlugin
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.community.stripe.googlepay.GooglePayExecutor
import com.getcapacitor.community.stripe.helper.MetaData
import com.getcapacitor.community.stripe.paymentflow.PaymentFlowExecutor
import com.getcapacitor.community.stripe.paymentsheet.PaymentSheetExecutor
import com.stripe.android.PaymentConfiguration
import com.stripe.android.Stripe
import com.stripe.android.core.AppInfo
import com.stripe.android.googlepaylauncher.GooglePayLauncher
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult
import com.stripe.android.paymentsheet.model.PaymentOption

@NativePlugin(name = "Stripe", requestCodes = [9972, 50000, 50001, 6000])
class StripePlugin : Plugin() {
    private var publishableKey: String? = null
    private var paymentSheetCallbackId: String? = null
    private var paymentFlowCallbackId: String? = null
    private var googlePayCallbackId: String? = null

    private val identityVerificationCallbackId: String? = null

    private lateinit var metaData: MetaData;

    private val paymentSheetExecutor = PaymentSheetExecutor(
        { this.context },
        { this.activity },
        { eventName: String?, data: JSObject? -> this.notifyListeners(eventName, data) },
        logTag
    )

    private val paymentFlowExecutor = PaymentFlowExecutor(
        { this.context },
        { this.activity },
        { eventName: String?, data: JSObject? -> this.notifyListeners(eventName, data) },
        logTag
    )

    private val googlePayExecutor = GooglePayExecutor(
        { this.context },
        { this.activity },
        { eventName: String?, data: JSObject? -> this.notifyListeners(eventName, data) },
        logTag
    )

    override fun load() {
        this.metaData = MetaData { this.context };
        if (metaData.enableGooglePay) {
            this.publishableKey = metaData.publishableKey

            PaymentConfiguration.init(
                context,
                metaData.publishableKey!!,
                metaData.stripeAccount
            )

            Stripe.appInfo = AppInfo.create(APP_INFO_NAME);

            googlePayExecutor.googlePayLauncher = GooglePayLauncher(
                activity,
                GooglePayLauncher.Config(
                    metaData.googlePayEnvironment!!,
                    metaData.countryCode!!,
                    metaData.displayName!!,
                    metaData.emailAddressRequired!!,
                    GooglePayLauncher.BillingAddressConfig(
                        metaData.billingAddressRequired!!,
                        if (metaData.billingAddressFormat == "Full") GooglePayLauncher.BillingAddressConfig.Format.Full else GooglePayLauncher.BillingAddressConfig.Format.Min,
                        metaData.phoneNumberRequired!!
                    ),
                    metaData.existingPaymentMethodRequired!!
                ),
                { isReady: Boolean -> googlePayExecutor.isAvailable = isReady },
                { result: GooglePayLauncher.Result ->
                    googlePayExecutor.onGooglePayResult(
                        bridge,
                        googlePayCallbackId,
                        result
                    )
                }
            )
        } else {
            Logger.info("Plugin didn't prepare Google Pay.")
        }

        paymentSheetExecutor.paymentSheet = PaymentSheet(activity) { result: PaymentSheetResult ->
            paymentSheetExecutor.onPaymentSheetResult(bridge, paymentSheetCallbackId, result)
        }

        paymentFlowExecutor.flowController = PaymentSheet.FlowController.create(
            activity,
            { paymentOption: PaymentOption? ->
                paymentFlowExecutor.onPaymentOption(bridge, paymentFlowCallbackId, paymentOption)
            },
            { result: PaymentSheetResult ->
                paymentFlowExecutor.onPaymentFlowResult(bridge, paymentFlowCallbackId, result)
            }
        )

        if (metaData.enableIdentifier) {
            val resources = activity.applicationContext.resources
            val resourceId = resources.getIdentifier("ic_launcher", "mipmap", activity.packageName)
            val icon = Uri.Builder()
                .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
                .authority(resources.getResourcePackageName(resourceId))
                .appendPath(resources.getResourceTypeName(resourceId))
                .appendPath(resources.getResourceEntryName(resourceId))
                .build()
        }
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        try {
            publishableKey = call.getString("publishableKey")

            if (publishableKey == null || publishableKey == "") {
                call.reject("you must provide a valid key")
                return
            }

            val stripeAccountId = call.getString("stripeAccount", null)

            PaymentConfiguration.init(context, publishableKey!!, stripeAccountId)
            Stripe.appInfo = AppInfo.create(APP_INFO_NAME);
            call.resolve()
        } catch (e: Exception) {
            call.reject("unable to set publishable key: " + e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun createPaymentSheet(call: PluginCall) {
        paymentSheetExecutor.createPaymentSheet(call)
    }

    @PluginMethod
    fun presentPaymentSheet(call: PluginCall) {
        paymentSheetCallbackId = call.callbackId
        bridge.saveCall(call)

        paymentSheetExecutor.presentPaymentSheet(call)
    }

    @PluginMethod
    fun createPaymentFlow(call: PluginCall) {
        paymentFlowExecutor.createPaymentFlow(call)
    }

    @PluginMethod
    fun presentPaymentFlow(call: PluginCall) {
        paymentFlowCallbackId = call.callbackId
        bridge.saveCall(call)

        paymentFlowExecutor.presentPaymentFlow(call)
    }

    @PluginMethod
    fun confirmPaymentFlow(call: PluginCall) {
        paymentFlowCallbackId = call.callbackId
        bridge.saveCall(call)

        paymentFlowExecutor.confirmPaymentFlow(call)
    }

    @PluginMethod
    fun isApplePayAvailable(call: PluginCall) {
        call.unimplemented("Not implemented on Android.")
    }

    @PluginMethod
    fun createApplePay(call: PluginCall) {
        call.unimplemented("Not implemented on Android.")
    }

    @PluginMethod
    fun presentApplePay(call: PluginCall) {
        call.unimplemented("Not implemented on Android.")
    }

    @PluginMethod
    fun isGooglePayAvailable(call: PluginCall) {
        googlePayExecutor.isGooglePayAvailable(call)
    }

    @PluginMethod
    fun createGooglePay(call: PluginCall) {
        googlePayExecutor.createGooglePay(call)
    }

    @PluginMethod
    fun presentGooglePay(call: PluginCall) {
        googlePayCallbackId = call.callbackId
        bridge.saveCall(call)

        googlePayExecutor.presentGooglePay(call)
    }

    companion object {
        private const val APP_INFO_NAME = "@capacitor-community/stripe"
    }
}
