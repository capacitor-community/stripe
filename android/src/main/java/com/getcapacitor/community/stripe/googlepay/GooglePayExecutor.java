package com.getcapacitor.community.stripe.googlepay;

import android.app.Activity;
import android.content.Context;
import androidx.core.util.Supplier;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.getcapacitor.community.stripe.paymentflow.PaymentFlowEvents;
import com.google.android.gms.common.util.BiConsumer;
import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.stripe.android.googlepaylauncher.GooglePayLauncher;
import com.stripe.android.googlepaylauncher.GooglePayPaymentMethodLauncher;


import org.jetbrains.annotations.NotNull;

public class GooglePayExecutor extends Executor {

    public GooglePayPaymentMethodLauncher googlePayPaymentMethodLauncher;
    private final JSObject emptyObject = new JSObject();
    private String clientSecret;
    public boolean isAvailable; // Ashu 3

    public GooglePayExecutor(
            Supplier<Context> contextSupplier,
            Supplier<Activity> activitySupplier,
            BiConsumer<String, JSObject> notifyListenersFunction,
            String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
        this.gson = new GsonBuilder()
                .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
                .create();
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
            notifyListenersFunction.accept(PaymentFlowEvents.FailedToLoad.getWebEventName(), emptyObject);
            call.reject("Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret, and customerId.");
            return;
        }

        call.resolve();
    }

    public void presentGooglePay(final PluginCall call) {
//        this.googlePayLauncher.presentForPaymentIntent(this.clientSecret);
        this.googlePayPaymentMethodLauncher.present("eur");
    }

    public void onGooglePayPaymentMethodResult(Bridge bridge, String callbackId, @NotNull GooglePayPaymentMethodLauncher.Result result) {
        PluginCall call = bridge.getSavedCall(callbackId);
        if (result instanceof GooglePayPaymentMethodLauncher.Result.Completed) {
            notifyListenersFunction.accept(GooglePayEvents.Completed.getWebEventName(), emptyObject);

            String paymentMethodId = ((GooglePayPaymentMethodLauncher.Result.Completed) result).getPaymentMethod().id;

            call.resolve(new JSObject()
                    .put("paymentResult", GooglePayEvents.Completed.getWebEventName())
                    .put("paymentMethodId", paymentMethodId));
        } else if (result instanceof GooglePayPaymentMethodLauncher.Result.Canceled) {
            notifyListenersFunction.accept(GooglePayEvents.Canceled.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", GooglePayEvents.Canceled.getWebEventName()));
        } else if (result instanceof GooglePayPaymentMethodLauncher.Result.Failed) {
            notifyListenersFunction.accept(
                    GooglePayEvents.Failed.getWebEventName(),
                    new JSObject().put("error", ((GooglePayPaymentMethodLauncher.Result.Failed) result).getError().getLocalizedMessage())
            );
            call.resolve(new JSObject().put("paymentResult", GooglePayEvents.Failed.getWebEventName()));
        }
    }
}
