package com.getcapacitor.community.stripe.paymentflow;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import androidx.activity.ComponentActivity;
import androidx.annotation.Nullable;
import androidx.core.util.Supplier;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.paymentsheet.PaymentOptionCallback;
import com.stripe.android.paymentsheet.PaymentSheet;
import com.stripe.android.paymentsheet.PaymentSheetResult;
import com.stripe.android.paymentsheet.PaymentSheetResultCallback;
import com.stripe.android.paymentsheet.model.PaymentOption;

public class PaymentFlowExecutor extends Executor {

    public PaymentSheet.FlowController flowController;
    private final JSObject emptyObject = new JSObject();
    private PaymentSheet.Configuration paymentConfiguration;

    private String paymentIntentClientSecret;
    private String setupIntentClientSecret;

    public PaymentFlowExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createPaymentFlow(final PluginCall call) {
        paymentIntentClientSecret = call.getString("paymentIntentClientSecret", null);
        setupIntentClientSecret = call.getString("setupIntentClientSecret", null);
        String customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret", null);
        String customerId = call.getString("customerId", null);

        if ((paymentIntentClientSecret == null && setupIntentClientSecret == null) || customerId == null) {
            notifyListeners(PaymentFlowEvents.FailedToLoad.getWebEventName(), emptyObject);
            call.reject("invalid Params");
            return;
        }

        String merchantDisplayName = call.getString("merchantDisplayName");

        if (merchantDisplayName == null) {
            merchantDisplayName = "";
        }

        paymentConfiguration =
            new PaymentSheet.Configuration(
                merchantDisplayName,
                new PaymentSheet.CustomerConfiguration(customerId, customerEphemeralKeySecret)
            );

        Boolean useGooglePay = call.getBoolean("useGooglePay", false);

        if (useGooglePay) {
            Boolean GooglePayEnvironment = call.getBoolean("GooglePayIsTesting", false);

            PaymentSheet.GooglePayConfiguration.Environment environment = PaymentSheet.GooglePayConfiguration.Environment.Production;
            if (GooglePayEnvironment) {
                environment = PaymentSheet.GooglePayConfiguration.Environment.Test;
            }

            final PaymentSheet.GooglePayConfiguration googlePayConfiguration = new PaymentSheet.GooglePayConfiguration(
                environment,
                call.getString("countryCode", "US")
            );
            paymentConfiguration.setGooglePay(googlePayConfiguration);
        }

        if (setupIntentClientSecret != null) {
            flowController.configureWithSetupIntent(
                setupIntentClientSecret,
                paymentConfiguration,
                (success, error) -> {
                    if (success) {
                        notifyListeners(PaymentFlowEvents.Loaded.getWebEventName(), emptyObject);
                        call.resolve();
                    } else {
                        notifyListeners(PaymentFlowEvents.FailedToLoad.getWebEventName(), emptyObject);
                        call.reject("");
                    }
                }
            );
        } else if (paymentIntentClientSecret != null) {
            flowController.configureWithPaymentIntent(
                paymentIntentClientSecret,
                paymentConfiguration,
                (success, error) -> {
                    if (success) {
                        notifyListeners(PaymentFlowEvents.Loaded.getWebEventName(), emptyObject);
                        call.resolve();
                    } else {
                        notifyListeners(PaymentFlowEvents.FailedToLoad.getWebEventName(), emptyObject);
                        call.reject("");
                    }
                }
            );
        }
    }

    public void presentPaymentFlow(final PluginCall call) {
        try {
            flowController.presentPaymentOptions();
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void confirmPaymentFlow(final PluginCall call) {
        try {
            flowController.confirm();
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void onPaymentOption(Bridge bridge, String callbackId, @Nullable PaymentOption paymentOption) {
        PluginCall call = bridge.getSavedCall(callbackId);
        if (paymentOption != null) {
            notifyListeners(PaymentFlowEvents.Created.getWebEventName(), new JSObject().put("cardNumber", paymentOption.getLabel()));
            call.resolve();
        } else {
            if (paymentOption != null) {
                notifyListeners(PaymentFlowEvents.Canceled.getWebEventName(), emptyObject);
                call.reject("");
            }
        }
    }

    public void onPaymentFlowResult(Bridge bridge, String callbackId, final PaymentSheetResult paymentSheetResult) {
        PluginCall call = bridge.getSavedCall(callbackId);

        if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
            notifyListeners(PaymentFlowEvents.Canceled.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Canceled.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
            notifyListeners(PaymentFlowEvents.Failed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Failed.getWebEventName()));
            // ((PaymentSheetResult.Failed) paymentSheetResult).getError()
        } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
            notifyListeners(PaymentFlowEvents.Completed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Completed.getWebEventName()));
        }
    }
}
