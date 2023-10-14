package com.getcapacitor.community.stripe.paymentflow;

import android.app.Activity;
import android.content.Context;

import androidx.annotation.Nullable;
import androidx.core.util.Supplier;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.paymentsheet.PaymentSheet;
import com.stripe.android.paymentsheet.PaymentSheetResult;
import com.stripe.android.paymentsheet.model.PaymentOption;

public class PaymentFlowExecutor extends Executor {

    public PaymentSheet.FlowController flowController;
    private final JSObject emptyObject = new JSObject();
    private PaymentSheet.Configuration paymentConfiguration;

    public PaymentFlowExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "PaymentFlowExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createPaymentFlow(final PluginCall call) {
        String paymentIntentClientSecret = call.getString("paymentIntentClientSecret", null);
        String setupIntentClientSecret = call.getString("setupIntentClientSecret", null);
        String customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret", null);
        String customerId = call.getString("customerId", null);

        if (paymentIntentClientSecret == null && setupIntentClientSecret == null) {
            String errorText = "Invalid Params. This method require paymentIntentClientSecret or setupIntentClientSecret.";
            notifyListenersFunction.accept(PaymentFlowEvents.FailedToLoad.getWebEventName(), new JSObject().put("error", errorText));
            call.reject(errorText);
            return;
        }

        if (customerId != null && customerEphemeralKeySecret == null) {
            String errorText = "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret.";
            notifyListenersFunction.accept(PaymentFlowEvents.FailedToLoad.getWebEventName(), new JSObject().put("error", errorText));
            call.reject(errorText);
            return;
        }

        String merchantDisplayName = call.getString("merchantDisplayName");

        if (merchantDisplayName == null) {
            merchantDisplayName = "";
        }

        Boolean enableGooglePay = call.getBoolean("enableGooglePay", false);

        final PaymentSheet.CustomerConfiguration customer = customerId != null
            ? new PaymentSheet.CustomerConfiguration(customerId, customerEphemeralKeySecret)
            : null;

        if (!enableGooglePay) {
            paymentConfiguration = new PaymentSheet.Configuration(merchantDisplayName, customer);
        } else {
            Boolean GooglePayEnvironment = call.getBoolean("GooglePayIsTesting", false);

            PaymentSheet.GooglePayConfiguration.Environment environment = PaymentSheet.GooglePayConfiguration.Environment.Production;

            if (GooglePayEnvironment) {
                environment = PaymentSheet.GooglePayConfiguration.Environment.Test;
            }

            paymentConfiguration =
                new PaymentSheet.Configuration(
                    merchantDisplayName,
                    customer,
                    new PaymentSheet.GooglePayConfiguration(environment, call.getString("countryCode", "US"))
                );
        }

        if (setupIntentClientSecret != null) {
            flowController.configureWithSetupIntent(
                setupIntentClientSecret,
                paymentConfiguration,
                (success, error) -> {
                    if (success) {
                        notifyListenersFunction.accept(PaymentFlowEvents.Loaded.getWebEventName(), emptyObject);
                        call.resolve();
                    } else {
                        notifyListenersFunction.accept(
                            PaymentFlowEvents.FailedToLoad.getWebEventName(),
                            new JSObject().put("error", error.getLocalizedMessage())
                        );
                        call.reject(error.getLocalizedMessage());
                    }
                }
            );
        } else if (paymentIntentClientSecret != null) {
            flowController.configureWithPaymentIntent(
                paymentIntentClientSecret,
                paymentConfiguration,
                (success, error) -> {
                    if (success) {
                        notifyListenersFunction.accept(PaymentFlowEvents.Loaded.getWebEventName(), emptyObject);
                        call.resolve();
                    } else {
                        notifyListenersFunction.accept(
                            PaymentFlowEvents.FailedToLoad.getWebEventName(),
                            new JSObject().put("error", error.getLocalizedMessage())
                        );
                        call.reject(error.getLocalizedMessage());
                    }
                }
            );
        }
    }

    public void presentPaymentFlow(final PluginCall call) {
        try {
            notifyListenersFunction.accept(PaymentFlowEvents.Opened.getWebEventName(), emptyObject);
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
            notifyListenersFunction.accept(
                PaymentFlowEvents.Created.getWebEventName(),
                new JSObject().put("cardNumber", paymentOption.getLabel())
            );
            call.resolve(new JSObject().put("cardNumber", paymentOption.getLabel()));
        } else {
            notifyListenersFunction.accept(PaymentFlowEvents.Canceled.getWebEventName(), emptyObject);
            call.reject("User close PaymentFlow Sheet");
        }
    }

    public void onPaymentFlowResult(Bridge bridge, String callbackId, final PaymentSheetResult paymentSheetResult) {
        PluginCall call = bridge.getSavedCall(callbackId);

        if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
            notifyListenersFunction.accept(PaymentFlowEvents.Canceled.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Canceled.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
            notifyListenersFunction.accept(
                PaymentFlowEvents.Failed.getWebEventName(),
                new JSObject().put("error", ((PaymentSheetResult.Failed) paymentSheetResult).getError().getLocalizedMessage())
            );
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Failed.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
            notifyListenersFunction.accept(PaymentFlowEvents.Completed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentFlowEvents.Completed.getWebEventName()));
        }
    }
}
