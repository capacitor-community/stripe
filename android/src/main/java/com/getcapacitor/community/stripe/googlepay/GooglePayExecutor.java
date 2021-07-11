package com.getcapacitor.community.stripe.googlepay;

import android.app.Activity;
import android.content.Context;
import androidx.core.util.Supplier;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.common.util.BiConsumer;

import com.getcapacitor.community.stripe.models.Executor;
import com.getcapacitor.community.stripe.GooglePayCallback;
import com.google.android.gms.wallet.AutoResolveHelper;
import com.google.android.gms.wallet.IsReadyToPayRequest;
import com.google.android.gms.wallet.PaymentData;
import com.google.android.gms.wallet.PaymentDataRequest;
import com.google.android.gms.wallet.PaymentsClient;
import com.google.android.gms.wallet.Wallet;
import com.google.android.gms.wallet.WalletConstants;
import com.stripe.android.GooglePayConfig;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;

public class GooglePayExecutor extends Executor {

    private final JSObject emptyObject = new JSObject();

    public GooglePayExecutor(
            Supplier<Context> contextSupplier,
            Supplier<Activity> activitySupplier,
            BiConsumer<String, JSObject> notifyListenersFunction,
            String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }


    public void isGooglePayAvailable(final PluginCall call, boolean isTest) {
        int env = GetGooglePayEnv(isTest);
        PaymentsClient paymentsClient = GooglePayPaymentsClient(this.contextSupplier.get(), env);
        IsReadyToPayRequest req = GooglePayDummyRequest();

        paymentsClient.isReadyToPay(req)
                .addOnCanceledListener(call::resolve);
    }

    public void  payWithGooglePay(final PluginCall call, boolean isTest, String publishableKey, GooglePayCallback googlePayCallback) {
        JSObject opts = call.getObject("googlePayOptions");

        GooglePayCallback cb = new GooglePayCallback() {
            @Override
            public void onError(@NotNull Exception err) {
                call.reject(err.getLocalizedMessage(), err);
            }

            @Override
            public void onSuccess(@NotNull PaymentData res) {
                JSObject resJs = new JSObject();

                resJs.put("success", true);
                resJs.put("token", res.toJson());
                call.resolve(resJs);
            }
        };

        processGooglePayTx(opts, cb, isTest, publishableKey, googlePayCallback);
    }

    private void processGooglePayTx(JSObject opts, GooglePayCallback callback, boolean isTest, String publishableKey, GooglePayCallback googlePayCallback) {
        int env = GetGooglePayEnv(isTest);

        PaymentsClient paymentsClient = GooglePayPaymentsClient(this.contextSupplier.get(), env);

        try {
            String paymentDataReq = GooglePayDataReq(publishableKey, opts);

            PaymentDataRequest req = PaymentDataRequest.fromJson(paymentDataReq);

            googlePayCallback = callback;

            AutoResolveHelper.resolveTask(
                    paymentsClient.loadPaymentData(req),
                    this.activitySupplier.get(),
                    9972
            );
        } catch (JSONException e) {
            callback.onError(e);
        }
    }

    private int GetGooglePayEnv(boolean isTest) {
        if (isTest) {
            return WalletConstants.ENVIRONMENT_TEST;
        } else {
            return WalletConstants.ENVIRONMENT_PRODUCTION;
        }
    }

    private PaymentsClient GooglePayPaymentsClient(Context context, int env) {
        return Wallet.getPaymentsClient(
                context,
                new Wallet.WalletOptions.Builder()
                        .setEnvironment(env)
                        .build()
        );
    }

    private IsReadyToPayRequest GooglePayDummyRequest() {
        JSArray allowedAuthMethods = new JSArray();
        allowedAuthMethods.put("PAN_ONLY");
        allowedAuthMethods.put("CRYPTOGRAM_3DS");

        JSArray allowedCardNetworks = new JSArray();
        allowedCardNetworks.put("AMEX");
        allowedCardNetworks.put("DISCOVER");
        allowedCardNetworks.put("JCB");
        allowedCardNetworks.put("MASTERCARD");
        allowedCardNetworks.put("VISA");

        JSObject isReadyToPayRequestJson = new JSObject();
        isReadyToPayRequestJson.put("allowedAuthMethods", allowedAuthMethods);
        isReadyToPayRequestJson.put("allowedCardNetworks", allowedCardNetworks);

        return IsReadyToPayRequest.fromJson(isReadyToPayRequestJson.toString());
    }

    private String GooglePayDataReq(String publishableKey, JSObject opts) throws JSONException {
        JSObject txInfo = GooglePayTxInfo(opts);
        boolean emailRequired = opts.getBoolean("emailRequired", false);
        String  merchantName = opts.getString("merchantName");
        JSObject cardPaymentMethod = GooglePayCardPaymentMethod(publishableKey, opts);

        JSObject req = new JSObject()
                .put("apiVersion", 2)
                .put("apiVersionMinor", 0)
                .put("allowedPaymentMethods", new JSArray().put(cardPaymentMethod))
                .put("transactionInfo", txInfo)
                .put("emailRequired", emailRequired);

        if (merchantName != null && !merchantName.isEmpty()) {
            req.putOpt(
                    "merchantInfo",
                    new JSObject().put("merchantName", merchantName)
            );
        }

        boolean shippingAddressRequired = opts.getBoolean("shippingAddressRequired", false);

        if (shippingAddressRequired) {
            JSObject shippingAddressParams = opts.getJSObject(
                    "shippingAddressParameters",
                    new JSObject()
            );

            req
                    .put("shippingAddressRequired", true)
                    .put("shippingAddressParameters", shippingAddressParams);
        }

        return req.toString();
    }

    private JSObject GooglePayTxInfo(JSObject opts) {
        String currencyCode = opts.getString("currencyCode");
        String countryCode = opts.getString("countryCode");
        String transactionId = opts.getString("transactionId");
        String totalPriceStatus = opts.getString("totalPriceStatus");
        String totalPrice = opts.getString("totalPrice");
        String totalPriceLabel = opts.getString("totalPriceLabel");
        String checkoutOption = opts.getString("checkoutOption");

        return new JSObject()
                .put("currencyCode", currencyCode)
                .put("countryCode", countryCode)
                .put("transactionId", transactionId)
                .put("totalPriceStatus", totalPriceStatus)
                .put("totalPrice", totalPrice)
                .put("totalPriceLabel", totalPriceLabel)
                .put("checkoutOption", checkoutOption);
    }

    private JSObject GooglePayCardPaymentMethod(String publishableKey, JSObject opts) throws JSONException {
        JSObject params = GooglePayCardParams(opts);
        JSObject tokenizationSpec = (JSObject) new GooglePayConfig(publishableKey).getTokenizationSpecification();

        return new JSObject()
                .put("type", "CARD")
                .put("parameters", params)
                .put("tokenizationSpecification", tokenizationSpec);
    }

    private JSObject GooglePayCardParams(JSObject opts) throws JSONException {
        JSONArray authMethods = opts.getJSONArray("allowedAuthMethods");
        JSONArray cardNetworks = opts.getJSONArray("allowedCardNetworks");
        boolean allowPrepaidCards = opts.getBoolean("allowPrepaidCards", true);
        boolean billingAddressRequired = opts.getBoolean("billingAddressRequired", false);
        JSObject billingAddressParams = opts.getJSObject("billingAddressParameters", new JSObject());

        return new JSObject()
                .put("allowedAuthMethods", authMethods)
                .put("allowedCardNetworks", cardNetworks)
                .put("allowPrepaidCards", allowPrepaidCards)
                .put("billingAddressRequired", billingAddressRequired)
                .put("billingAddressParameters", billingAddressParams);
    }
}
