package com.getcapacitor.community.stripe.googlepay;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import androidx.core.util.Supplier;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.googlepaylauncher.GooglePayLauncher;
import org.jetbrains.annotations.NotNull;

public class GooglePayExecutor extends Executor {

    public GooglePayLauncher googlePayLauncher;
    private final JSObject emptyObject = new JSObject();
    private String clientSecret;
    public boolean isAvailable;

    public GooglePayExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void isGooglePayAvailable(final PluginCall call) {
        if (isAvailable) {
            call.resolve();
        } else {
            call.unimplemented("Not implemented on Device.");
        }
    }

    public void createGooglePay(final PluginCall call) {
        this.clientSecret = call.getString("paymentIntentClientSecret");

        if (this.clientSecret == null) {
            notifyListenersFunction.accept(GooglePayEvents.FailedToLoad.getWebEventName(), emptyObject);
            call.reject("Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret, and customerId.");
            return;
        }

        notifyListenersFunction.accept(GooglePayEvents.Loaded.getWebEventName(), emptyObject);
        call.resolve();
    }

    public void presentGooglePay(final PluginCall call) {
        this.googlePayLauncher.presentForPaymentIntent(this.clientSecret);
    }

    public void onGooglePayResult(Bridge bridge, String callbackId, @NotNull GooglePayLauncher.Result result) {
        PluginCall call = bridge.getSavedCall(callbackId);

        if (result instanceof GooglePayLauncher.Result.Completed) {
            notifyListenersFunction.accept(GooglePayEvents.Completed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", GooglePayEvents.Completed.getWebEventName()));
        } else if (result instanceof GooglePayLauncher.Result.Canceled) {
            notifyListenersFunction.accept(GooglePayEvents.Canceled.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", GooglePayEvents.Canceled.getWebEventName()));
        } else if (result instanceof GooglePayLauncher.Result.Failed) {
            notifyListenersFunction.accept(
                GooglePayEvents.Failed.getWebEventName(),
                new JSObject().put("error", ((GooglePayLauncher.Result.Failed) result).getError().getLocalizedMessage())
            );
            call.resolve(new JSObject().put("paymentResult", GooglePayEvents.Failed.getWebEventName()));
        }
    }
}
