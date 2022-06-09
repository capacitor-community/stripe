package com.getcapacitor.community.stripe;

import com.getcapacitor.Logger;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.community.stripe.googlepay.GooglePayExecutor;
import com.getcapacitor.community.stripe.helper.MetaData;
import com.getcapacitor.community.stripe.paymentflow.PaymentFlowExecutor;
import com.getcapacitor.community.stripe.paymentsheet.PaymentSheetExecutor;
import com.stripe.android.AppInfo;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.googlepaylauncher.GooglePayLauncher;
import com.stripe.android.paymentsheet.PaymentSheet;
import org.jetbrains.annotations.NotNull;

@NativePlugin(name = "Stripe", requestCodes = { 9972, 50000, 50001, 6000 })
public class StripePlugin extends Plugin {

    private String publishableKey;
    private String paymentSheetCallbackId;
    private String paymentFlowCallbackId;
    private String googlePayCallbackId;

    private MetaData metaData;

    private static final String APP_INFO_NAME = "@capacitor-community/stripe";

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

    private final GooglePayExecutor googlePayExecutor = new GooglePayExecutor(
        this::getContext,
        this::getActivity,
        this::notifyListeners,
        getLogTag()
    );

    @Override
    public void load() {
        metaData = new MetaData(this::getContext);
        if (metaData.enableGooglePay) {
            this.publishableKey = metaData.publishableKey;

            PaymentConfiguration.init(getContext(), metaData.publishableKey, metaData.stripeAccount);
            Stripe.setAppInfo(AppInfo.create(APP_INFO_NAME));

            this.googlePayExecutor.googlePayLauncher =
                new GooglePayLauncher(
                    getActivity(),
                    new GooglePayLauncher.Config(metaData.googlePayEnvironment, metaData.countryCode, metaData.displayName),
                    (boolean isReady) -> this.googlePayExecutor.isAvailable = isReady,
                    (@NotNull GooglePayLauncher.Result result) ->
                        this.googlePayExecutor.onGooglePayResult(bridge, googlePayCallbackId, result)
                );
        } else {
            Logger.info("Plugin didn't prepare Google Pay.");
        }

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
            if (publishableKey == null) {
                publishableKey = call.getString("publishableKey");

                if (publishableKey == null || publishableKey.equals("")) {
                    call.reject("you must provide a valid key");
                    return;
                }

                String stripeAccountId = call.getString("stripeAccount", null);

                PaymentConfiguration.init(getContext(), publishableKey, stripeAccountId);
                Stripe.setAppInfo(AppInfo.create(APP_INFO_NAME));
            } else {
                Logger.info("PaymentConfiguration.init was run at load");
            }
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

    @PluginMethod
    public void isGooglePayAvailable(final PluginCall call) {
        googlePayExecutor.isGooglePayAvailable(call);
    }

    @PluginMethod
    public void createGooglePay(final PluginCall call) {
        googlePayExecutor.createGooglePay(call);
    }

    @PluginMethod
    public void presentGooglePay(final PluginCall call) {
        googlePayCallbackId = call.getCallbackId();
        bridge.saveCall(call);

        googlePayExecutor.presentGooglePay(call);
    }
}
