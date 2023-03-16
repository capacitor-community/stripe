package com.getcapacitor.community.stripe.identityverification;

import android.app.Activity;
import android.content.Context;
import androidx.core.util.Supplier;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.Logger;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.identity.IdentityVerificationSheet;

public class IdentityVerificationSheetExecutor extends Executor {

    public IdentityVerificationSheet verificationSheet;
    private final JSObject emptyObject = new JSObject();

    private String verificationId;
    private String ephemeralKeySecret;

    public IdentityVerificationSheetExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "VerificationSheetExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createIdentityVerificationSheet(final PluginCall call) {
        verificationId = call.getString("verificationId", null);
        ephemeralKeySecret = call.getString("ephemeralKeySecret", null);

        if (verificationId == null || ephemeralKeySecret == null) {
            String errorText = "Invalid Params. This method require verificationId or ephemeralKeySecret.";
            notifyListenersFunction.accept(
                IdentityVerificationSheetEvent.FailedToLoad.getWebEventName(),
                new JSObject().put("error", errorText)
            );
            call.reject(errorText);
            return;
        }

        notifyListenersFunction.accept(IdentityVerificationSheetEvent.Loaded.getWebEventName(), emptyObject);
        call.resolve();
    }

    public void presentIdentityVerificationSheet(final PluginCall call) {
        try {
            verificationSheet.present(this.verificationId, this.ephemeralKeySecret);
            Logger.info("Presented Identity Verification Sheet");
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void onVerificationCompleted(Bridge bridge, String callbackId) {
        PluginCall call = bridge.getSavedCall(callbackId);
        notifyListenersFunction.accept(IdentityVerificationSheetEvent.Completed.getWebEventName(), emptyObject);
        call.resolve(new JSObject().put("identityVerificationResult", IdentityVerificationSheetEvent.Completed.getWebEventName()));
    }

    public void onVerificationCancelled(Bridge bridge, String callbackId) {
        PluginCall call = bridge.getSavedCall(callbackId);
        notifyListenersFunction.accept(IdentityVerificationSheetEvent.Canceled.getWebEventName(), emptyObject);
        call.resolve(new JSObject().put("identityVerificationResult", IdentityVerificationSheetEvent.Canceled.getWebEventName()));
    }

    public void onVerificationFailed(Bridge bridge, String callbackId) {
        PluginCall call = bridge.getSavedCall(callbackId);
        notifyListenersFunction.accept(IdentityVerificationSheetEvent.Failed.getWebEventName(), emptyObject);
        call.resolve(new JSObject().put("identityVerificationResult", IdentityVerificationSheetEvent.Failed.getWebEventName()));
    }
}
