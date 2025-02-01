package com.getcapacitor.community.stripe.identity

import android.content.ContentResolver
import android.net.Uri
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.stripe.android.identity.IdentityVerificationSheet
import com.stripe.android.identity.IdentityVerificationSheet.Companion.create
import com.stripe.android.identity.IdentityVerificationSheet.VerificationFlowResult

@CapacitorPlugin(name = "StripeIdentity")
class StripeIdentityPlugin : Plugin() {
    private var identityVerificationCallbackId: String? = null

    private val implementation = StripeIdentity(
        { this.context },
        { this.activity },
        { eventName: String?, data: JSObject? -> this.notifyListeners(eventName, data) },
        logTag
    )

    override fun load() {
        val resources = activity.applicationContext.resources
        val resourceId = resources.getIdentifier("ic_launcher", "mipmap", activity.packageName)
        val icon = Uri.Builder()
            .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
            .authority(resources.getResourcePackageName(resourceId))
            .appendPath(resources.getResourceTypeName(resourceId))
            .appendPath(resources.getResourceEntryName(resourceId))
            .build()

        implementation.verificationSheet = create(
            activity,
            IdentityVerificationSheet.Configuration(icon)
        ) { verificationFlowResult: VerificationFlowResult? ->
            // handle verificationResult
            if (verificationFlowResult is VerificationFlowResult.Completed) {
                // The user has completed uploading their documents.
                // Let them know that the verification is processing.
                implementation.onVerificationCompleted(bridge, identityVerificationCallbackId)
            } else if (verificationFlowResult is VerificationFlowResult.Canceled) {
                // The user did not complete uploading their documents.
                // You should allow them to try again.
                implementation.onVerificationCancelled(bridge, identityVerificationCallbackId)
            } else if (verificationFlowResult is VerificationFlowResult.Failed) {
                // If the flow fails, you should display the localized error
                // message to your user using throwable.getLocalizedMessage()
                implementation.onVerificationFailed(bridge, identityVerificationCallbackId)
            }
        }
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        implementation.initialize(call)
    }

    @PluginMethod
    fun create(call: PluginCall) {
        implementation.create(call)
    }

    @PluginMethod
    fun present(call: PluginCall) {
        identityVerificationCallbackId = call.callbackId

        call.setKeepAlive(true);
        bridge.saveCall(call)

        implementation.present(call)
    }
}
