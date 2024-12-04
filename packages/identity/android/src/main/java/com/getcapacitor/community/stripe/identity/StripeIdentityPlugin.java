package com.getcapacitor.community.stripe.identity;

import android.content.ContentResolver;
import android.content.res.Resources;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.stripe.android.identity.IdentityVerificationSheet;

@CapacitorPlugin(name = "StripeIdentity")
public class StripeIdentityPlugin extends Plugin {

    private String identityVerificationCallbackId;

    private final StripeIdentity implementation = new StripeIdentity(
        this::getContext,
        this::getActivity,
        this::notifyListeners,
        getLogTag()
    );

    @Override
    public void load() {
        Resources resources = getActivity().getApplicationContext().getResources();
        int resourceId = resources.getIdentifier("ic_launcher", "mipmap", getActivity().getPackageName());
        Uri icon = new Uri.Builder()
            .scheme(ContentResolver.SCHEME_ANDROID_RESOURCE)
            .authority(resources.getResourcePackageName(resourceId))
            .appendPath(resources.getResourceTypeName(resourceId))
            .appendPath(resources.getResourceEntryName(resourceId))
            .build();

        this.implementation.verificationSheet = IdentityVerificationSheet.Companion.create(
            getActivity(),
            new IdentityVerificationSheet.Configuration(icon),
            verificationFlowResult -> {
                // handle verificationResult
                if (verificationFlowResult instanceof IdentityVerificationSheet.VerificationFlowResult.Completed) {
                    // The user has completed uploading their documents.
                    // Let them know that the verification is processing.
                    this.implementation.onVerificationCompleted(bridge, identityVerificationCallbackId);
                } else if (verificationFlowResult instanceof IdentityVerificationSheet.VerificationFlowResult.Canceled) {
                    // The user did not complete uploading their documents.
                    // You should allow them to try again.
                    this.implementation.onVerificationCancelled(bridge, identityVerificationCallbackId);
                } else if (verificationFlowResult instanceof IdentityVerificationSheet.VerificationFlowResult.Failed) {
                    // If the flow fails, you should display the localized error
                    // message to your user using throwable.getLocalizedMessage()
                    this.implementation.onVerificationFailed(bridge, identityVerificationCallbackId);
                }
            }
        );
    }

    @PluginMethod
    public void initialize(final PluginCall call) {
        implementation.initialize(call);
    }

    @PluginMethod
    public void create(final PluginCall call) {
        implementation.create(call);
    }

    @PluginMethod
    public void present(final PluginCall call) {
        identityVerificationCallbackId = call.getCallbackId();
        bridge.saveCall(call);

        implementation.present(call);
    }
}
