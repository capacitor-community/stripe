package com.getcapacitor.community.stripe;

import android.content.Context;
import android.util.Log;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.IsReadyToPayRequest;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.stripe.android.PaymentConfiguration;

import com.stripe.android.Stripe;
import android.Manifest;

import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;

import com.stripe.android.GooglePayConfig;
import com.getcapacitor.community.stripe.googlepay.GooglePayExecutor;


@CapacitorPlugin(
        name = "Stripe",
        permissions = { @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }) }
)
class StripePlugin extends Plugin {
    private Stripe stripeInstance;
    private String publishableKey;
    private Boolean isTest = true;
    private GooglePayCallback googlePayCallback = null;

    private final GooglePayExecutor googlePayExecutor = new GooglePayExecutor(
            this::getContext,
            this::getActivity,
            this::notifyListeners,
            getLogTag()
    );

    @PluginMethod
    public void initialize(final PluginCall call) {
        try {
            String publishableKey = call.getString("publishableKey");

            if (publishableKey == null || publishableKey.equals("")) {
                call.reject("you must provide a valid key");
                return;
            }

            stripeInstance = new Stripe(getContext(), publishableKey);
            isTest = publishableKey.contains("test");
            PaymentConfiguration.init(getContext(), publishableKey);
            call.resolve();
        } catch (Exception e) {
            call.reject("unable to set publishable key: " + e.getLocalizedMessage(), e);
        }

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
    public void  payWithGooglePay(final PluginCall call) {
        googlePayExecutor.payWithGooglePay(call, isTest, publishableKey, googlePayCallback);
    }
}
