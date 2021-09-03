package com.getcapacitor.community.stripe.googlepay;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import androidx.activity.ComponentActivity;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.util.Supplier;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.getcapacitor.community.stripe.paymentflow.PaymentFlowEvents;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.googlepaylauncher.GooglePayEnvironment;
import com.stripe.android.googlepaylauncher.GooglePayLauncher;
import com.stripe.android.paymentsheet.PaymentOptionCallback;
import com.stripe.android.paymentsheet.PaymentSheet;
import com.stripe.android.paymentsheet.PaymentSheetResult;
import com.stripe.android.paymentsheet.PaymentSheetResultCallback;
import com.stripe.android.paymentsheet.model.PaymentOption;
import org.jetbrains.annotations.NotNull;

public class GooglePayExecutor extends Executor {

    private final JSObject emptyObject = new JSObject();
    private GooglePayLauncher googlePayLauncher;
    private String clientSecret;
    private String callbackId;
    private Bridge bridge;

    public GooglePayExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void isGooglePayAvailable(final PluginCall call, final boolean isTest) {
        // Dummy Launcher
        new GooglePayLauncher(
            this,
            new GooglePayLauncher.Config(isTest ? GooglePayEnvironment.Test : GooglePayEnvironment.Production, "US", "Widget Store"),
            (boolean isReady) -> {
                if (!isReady) {
                    call.reject("Can not use on this Device.");
                    return;
                }
                call.resolve();
            },
            (@NotNull GooglePayLauncher.Result result) -> {}
        );
    }

    public void createGooglePay(final PluginCall call, final boolean isTest) {
        this.clientSecret = call.getString("paymentIntentClientSecret");
        String merchantName = call.getString("merchantName");

        if (this.clientSecret == null || merchantName == null) {
            notifyListenersFunction.accept(PaymentFlowEvents.FailedToLoad.getWebEventName(), emptyObject);
            call.reject("Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret, and customerId.");
            return;
        }

        this.googlePayLauncher =
            new GooglePayLauncher(
                this,
                new GooglePayLauncher.Config(
                    isTest ? GooglePayEnvironment.Test : GooglePayEnvironment.Production,
                    call.getString("countryCode", "US"),
                    merchantName
                ),
                (boolean isReady) -> {
                    if (!isReady) {
                        notifyListeners(GooglePayEvents.FailedToLoad.getWebEventName(), emptyObject);
                        return;
                    }
                    notifyListeners(GooglePayEvents.Loaded.getWebEventName(), emptyObject);
                },
                this::onGooglePayResult
            );

        call.resolve();
    }

    public void presentGooglePay(Bridge bridge, final PluginCall call) {
        callbackId = call.getCallbackId();
        this.bridge = bridge;
        this.googlePayLauncher.presentForPaymentIntent(this.clientSecret);
    }

    private void onGooglePayResult(@NotNull GooglePayLauncher.Result result) {
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
