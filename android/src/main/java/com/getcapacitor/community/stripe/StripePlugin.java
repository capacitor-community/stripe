package com.getcapacitor.community.stripe;

import android.app.Activity;
import android.util.Log;

import androidx.activity.ComponentActivity;

import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.community.stripe.googlepay.GooglePayExecutor;
import com.getcapacitor.community.stripe.paymentsheet.PaymentSheetExecutor;
import com.stripe.android.PaymentConfiguration;
import com.stripe.android.Stripe;
import com.stripe.android.paymentsheet.PaymentSheet;

@NativePlugin(name = "Stripe", requestCodes = { 9972, 50000, 50001, 6000 })
public class StripePlugin extends Plugin {

//    private Stripe stripeInstance;
    private String publishableKey;
    private Boolean isTest = true;
    private GooglePayCallback googlePayCallback = null;

    private final PaymentSheetExecutor paymentSheetExecutor = new PaymentSheetExecutor(
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
        this.paymentSheetExecutor.paymentSheet = new PaymentSheet(getActivity(), result -> {
            this.paymentSheetExecutor.onPaymentSheetResult(result);
        });
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
        paymentSheetExecutor.createPaymentSheet(call, publishableKey);
    }

    @PluginMethod
    public void presentPaymentSheet(final PluginCall call) {
        paymentSheetExecutor.presentPaymentSheet(call, bridge);
    }

    @PluginMethod
    public void isApplePayAvailable(final PluginCall call) {
        call.reject("Apple Pay is not available on Android");
    }

    @PluginMethod
    public void isGooglePayAvailable(final PluginCall call) {
        googlePayExecutor.isGooglePayAvailable(call, isTest);
    }

    @PluginMethod
    public void payWithGooglePay(final PluginCall call) {
        googlePayExecutor.payWithGooglePay(call, isTest, publishableKey, googlePayCallback);
    }
}
