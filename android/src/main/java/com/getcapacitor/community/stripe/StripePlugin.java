package com.getcapacitor.community.stripe;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.community.stripe.paymentflow.PaymentFlowExecutor;
import com.getcapacitor.community.stripe.paymentsheet.PaymentSheetExecutor;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.paymentsheet.PaymentSheet;

@NativePlugin(name = "Stripe", requestCodes = { 9972, 50000, 50001, 6000 })
public class StripePlugin extends Plugin {

    //    private Stripe stripeInstance;
    private String publishableKey;
    private Boolean isTest = true;
    private GooglePayCallback googlePayCallback = null;
    private String paymentSheetCallbackId;
    private String paymentFlowCallbackId;

    private final PaymentSheetExecutor paymentSheetExecutor = new PaymentSheetExecutor(
        this::getContext,
        this::getActivity,
        this::notifyListeners,
        getLogTag()
    );

    private final PaymentFlowExecutor paymentFlowExecutor = new PaymentFlowExecutor(
        this::getContext,
        this::getActivity,
        this::notifyListeners,
        getLogTag()
    );

    @Override
    public void load() {
        this.paymentSheetExecutor.paymentSheet =
            new PaymentSheet(
                getActivity(),
                result -> {
                    this.paymentSheetExecutor.onPaymentSheetResult(bridge, paymentSheetCallbackId, result);
                }
            );

        this.paymentFlowExecutor.flowController =
            PaymentSheet.FlowController.create(
                getActivity(),
                paymentOption -> {
                    this.paymentFlowExecutor.onPaymentOption(bridge, paymentFlowCallbackId, paymentOption);
                },
                result -> {
                    this.paymentFlowExecutor.onPaymentFlowResult(bridge, paymentFlowCallbackId, result);
                }
            );
    }

    @PluginMethod
    public void initialize(final PluginCall call) {
        try {
            publishableKey = call.getString("publishableKey");

            if (publishableKey == null || publishableKey.equals("")) {
                call.reject("you must provide a valid key");
                return;
            }
            //            stripeInstance = new Stripe(getContext(), publishableKey);
            isTest = publishableKey.contains("test");
            PaymentConfiguration.init(getContext(), publishableKey);
            call.resolve();
        } catch (Exception e) {
            call.reject("unable to set publishable key: " + e.getLocalizedMessage(), e);
        }
    }

    @PluginMethod
    public void createPaymentSheet(final PluginCall call) {
        paymentSheetExecutor.createPaymentSheet(call);
    }

    @PluginMethod
    public void presentPaymentSheet(final PluginCall call) {
        paymentSheetCallbackId = call.getCallbackId();
        bridge.saveCall(call);

        paymentSheetExecutor.presentPaymentSheet(call);
    }

    @PluginMethod
    public void createPaymentFlow(final PluginCall call) {
        paymentFlowExecutor.createPaymentFlow(call);
    }

    @PluginMethod
    public void presentPaymentFlow(final PluginCall call) {
        paymentFlowCallbackId = call.getCallbackId();
        bridge.saveCall(call);

        paymentFlowExecutor.presentPaymentFlow(call);
    }

    @PluginMethod
    public void confirmPaymentFlow(final PluginCall call) {
        paymentFlowCallbackId = call.getCallbackId();
        bridge.saveCall(call);

        paymentFlowExecutor.confirmPaymentFlow(call);
    }

    @PluginMethod
    public void isApplePayAvailable(final PluginCall call) {
        call.unimplemented("Not implemented on Android.");
    }

    @PluginMethod
    public void createApplePay(final PluginCall call) {
        call.unimplemented("Not implemented on Android.");
    }

    @PluginMethod
    public void presentApplePay(final PluginCall call) {
        call.unimplemented("Not implemented on Android.");
    }
}
