package com.getcapacitor.community.stripe.identity

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.Bridge
import com.getcapacitor.JSObject
import com.getcapacitor.Logger
import com.getcapacitor.PluginCall
import com.getcapacitor.community.stripe.identity.models.Executor
import com.google.android.gms.common.util.BiConsumer
import com.stripe.android.identity.IdentityVerificationSheet

class StripeIdentity(
    contextSupplier: Supplier<Context>,
    activitySupplier: Supplier<Activity>,
    notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String
) : Executor(
    contextSupplier,
    activitySupplier,
    notifyListenersFunction,
    pluginLogTag,
    "StripeIdentityExecutor"
) {
    var verificationSheet: IdentityVerificationSheet? = null
    private val emptyObject = JSObject()

    private var verificationId: String? = null
    private var ephemeralKeySecret: String? = null

    init {
        this.contextSupplier = contextSupplier
    }

    fun initialize(call: PluginCall) {
        call.resolve()
    }

    fun create(call: PluginCall) {
        verificationId = call.getString("verificationId", null)
        ephemeralKeySecret = call.getString("ephemeralKeySecret", null)

        if (verificationId == null || ephemeralKeySecret == null) {
            val errorText =
                "Invalid Params. This method require verificationId or ephemeralKeySecret."
            notifyListeners(
                IdentityVerificationSheetEvent.FailedToLoad.webEventName,
                JSObject().put("error", errorText)
            )
            call.reject(errorText)
            return
        }

        this.notifyListeners(IdentityVerificationSheetEvent.Loaded.webEventName, emptyObject)
        call.resolve()
    }

    fun present(call: PluginCall) {
        try {
            verificationSheet!!.present(
                verificationId!!,
                ephemeralKeySecret!!
            )
            Logger.info("Presented Identity Verification Sheet")
        } catch (ex: Exception) {
            call.reject(ex.localizedMessage, ex)
        }
    }

    fun onVerificationCompleted(bridge: Bridge, callbackId: String?) {
        val call = bridge.getSavedCall(callbackId)
        notifyListeners(IdentityVerificationSheetEvent.Completed.webEventName, emptyObject)

        if (call) {
            call.resolve(
                JSObject().put(
                    "identityVerificationResult",
                    IdentityVerificationSheetEvent.Completed.webEventName
                )
            )
        } else {
            Logger.error("onVerificationCompleted: No callbackId found")
        }
    }

    fun onVerificationCancelled(bridge: Bridge, callbackId: String?) {
        val call = bridge.getSavedCall(callbackId)
        notifyListeners(IdentityVerificationSheetEvent.Canceled.webEventName, emptyObject)

        if (call) {
            call.resolve(
                JSObject().put(
                    "identityVerificationResult",
                    IdentityVerificationSheetEvent.Canceled.webEventName
                )
            )
        } else {
            Logger.error("onVerificationCancelled: No callbackId found")
        }
    }

    fun onVerificationFailed(bridge: Bridge, callbackId: String?) {
        val call = bridge.getSavedCall(callbackId)
        notifyListeners(IdentityVerificationSheetEvent.Failed.webEventName, emptyObject)

        if (call) {
            call.resolve(
                JSObject().put(
                    "identityVerificationResult",
                    IdentityVerificationSheetEvent.Failed.webEventName
                )
            )
        } else {
            Logger.error("onVerificationFailed: No callbackId found")
        }
    }
}
