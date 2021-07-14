package com.getcapacitor.community.stripe.paymentsheet;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import androidx.activity.ComponentActivity;
import androidx.core.util.Supplier;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.paymentsheet.PaymentSheet;
import com.stripe.android.paymentsheet.PaymentSheetResult;
import com.stripe.android.paymentsheet.PaymentSheetResultCallback;

public class PaymentSheetExecutor extends Executor {

    private final JSObject emptyObject = new JSObject();
    private PaymentSheet paymentSheet;
    private PaymentSheet.Configuration paymentConfiguration;

    private String paymentIntentClientSecret;

    public PaymentSheetExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createPaymentSheet(final PluginCall call, String publishableKey) {
        PaymentConfiguration.init(this.contextSupplier.get(), publishableKey);

        paymentIntentClientSecret = call.getString("paymentIntentClientSecret");
        String customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret");
        String customerId = call.getString("customerId");

        if (paymentIntentClientSecret == null || customerEphemeralKeySecret == null || customerId == null) {
            notifyListeners(PaymentSheetEvents.FailedToLoad.getWebEventName(), emptyObject);
            call.reject("invalid Params");
            return;
        }
        paymentConfiguration = new PaymentSheet.Configuration(
                "Example, Inc.",
                new PaymentSheet.CustomerConfiguration(
                        customerId,
                        customerEphemeralKeySecret
                )
        );

        notifyListeners(PaymentSheetEvents.Loaded.getWebEventName(), emptyObject);
        call.resolve();
    }

    public void presentPaymentSheet(final PluginCall call, Bridge bridge) {
        paymentSheet = new PaymentSheet(bridge.getActivity(), result -> {
            onPaymentSheetResult(result);
        });

        try {
            paymentSheet.presentWithPaymentIntent(
                    paymentIntentClientSecret,
                    paymentConfiguration
            );
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    private void onPaymentSheetResult(
            final PaymentSheetResult paymentSheetResult
    ) {
        if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
            notifyListeners(PaymentSheetEvents.Canceled.getWebEventName(), emptyObject);
//            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Canceled.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
            notifyListeners(PaymentSheetEvents.Failed.getWebEventName(), emptyObject);
//            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Failed.getWebEventName()));
            // ((PaymentSheetResult.Failed) paymentSheetResult).getError()
        } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
            notifyListeners(PaymentSheetEvents.Completed.getWebEventName(), emptyObject);
//            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Completed.getWebEventName()));
        }
    }
}
