package com.getcapacitor.community.stripe.paymentsheet;

import android.app.Activity;
import android.content.Context;

import androidx.core.util.Supplier;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.android.paymentsheet.PaymentSheet;
import com.stripe.android.paymentsheet.PaymentSheetResult;

public class PaymentSheetExecutor extends Executor {

    public PaymentSheet paymentSheet;
    private final JSObject emptyObject = new JSObject();
    private PaymentSheet.Configuration paymentConfiguration;

    private String paymentIntentClientSecret;
    private String setupIntentClientSecret;

    public PaymentSheetExecutor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "PaymentSheetExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createPaymentSheet(final PluginCall call) {
        paymentIntentClientSecret = call.getString("paymentIntentClientSecret", null);
        setupIntentClientSecret = call.getString("setupIntentClientSecret", null);

        String customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret", null);
        String customerId = call.getString("customerId", null);

        if (paymentIntentClientSecret == null && setupIntentClientSecret == null) {
            String errorText = "Invalid Params. This method require paymentIntentClientSecret or setupIntentClientSecret.";
            notifyListenersFunction.accept(PaymentSheetEvents.FailedToLoad.getWebEventName(), new JSObject().put("error", errorText));
            call.reject(errorText);
            return;
        }

        if (customerId != null && customerEphemeralKeySecret == null) {
            String errorText = "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret.";
            notifyListenersFunction.accept(PaymentSheetEvents.FailedToLoad.getWebEventName(), new JSObject().put("error", errorText));
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

        PaymentSheet.BillingDetailsCollectionConfiguration billingDetailsCollectionConfiguration = null;
        JSObject bdCollectionConfiguration = call.getObject("billingDetailsCollectionConfiguration", null);
        if (bdCollectionConfiguration != null){
            String emailCollectionMode = bdCollectionConfiguration.getString("email");
            String nameCollectionMode = bdCollectionConfiguration.getString("name");
            String phoneCollectionMode = bdCollectionConfiguration.getString("phone");
            String addressCollectionMode = bdCollectionConfiguration.getString("address");
            billingDetailsCollectionConfiguration = new PaymentSheet.BillingDetailsCollectionConfiguration(
                    (nameCollectionMode != null && nameCollectionMode.equals("always")) ? PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Always : PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Automatic,
                    (phoneCollectionMode != null && phoneCollectionMode.equals("always")) ? PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Always : PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Automatic,
                    (emailCollectionMode != null && emailCollectionMode.equals("always")) ? PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Always : PaymentSheet.BillingDetailsCollectionConfiguration.CollectionMode.Automatic,
                    (addressCollectionMode != null && addressCollectionMode.equals("full")) ? PaymentSheet.BillingDetailsCollectionConfiguration.AddressCollectionMode.Full : PaymentSheet.BillingDetailsCollectionConfiguration.AddressCollectionMode.Automatic,
                    false
            );
        }

        if (!enableGooglePay) {
            if (bdCollectionConfiguration != null) {
                paymentConfiguration = new PaymentSheet.Configuration.Builder(merchantDisplayName)
                        .customer(customer)
                        .billingDetailsCollectionConfiguration(billingDetailsCollectionConfiguration)
                        .build();
            } else {
                paymentConfiguration = new PaymentSheet.Configuration.Builder(merchantDisplayName)
                        .customer(customer)
                        .build();
            }
        } else {
            Boolean GooglePayEnvironment = call.getBoolean("GooglePayIsTesting", false);

            PaymentSheet.GooglePayConfiguration.Environment environment = PaymentSheet.GooglePayConfiguration.Environment.Production;

            if (GooglePayEnvironment) {
                environment = PaymentSheet.GooglePayConfiguration.Environment.Test;
            }

            if (bdCollectionConfiguration != null) {
                paymentConfiguration = new PaymentSheet.Configuration.Builder(merchantDisplayName)
                        .customer(customer)
                        .googlePay(new PaymentSheet.GooglePayConfiguration(environment, call.getString("countryCode", "US")))
                        .billingDetailsCollectionConfiguration(billingDetailsCollectionConfiguration)
                        .build();
            } else {
                paymentConfiguration = new PaymentSheet.Configuration.Builder(merchantDisplayName)
                        .customer(customer)
                        .googlePay(new PaymentSheet.GooglePayConfiguration(environment, call.getString("countryCode", "US")))
                        .build();
            }

        }

        notifyListenersFunction.accept(PaymentSheetEvents.Loaded.getWebEventName(), emptyObject);
        call.resolve();
    }

    public void presentPaymentSheet(final PluginCall call) {
        try {
            if (paymentIntentClientSecret != null) {
                paymentSheet.presentWithPaymentIntent(paymentIntentClientSecret, paymentConfiguration);
            } else {
                paymentSheet.presentWithSetupIntent(setupIntentClientSecret, paymentConfiguration);
            }
        } catch (Exception ex) {
            call.reject(ex.getLocalizedMessage(), ex);
        }
    }

    public void onPaymentSheetResult(Bridge bridge, String callbackId, final PaymentSheetResult paymentSheetResult) {
        PluginCall call = bridge.getSavedCall(callbackId);

        if (paymentSheetResult instanceof PaymentSheetResult.Canceled) {
            notifyListenersFunction.accept(PaymentSheetEvents.Canceled.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Canceled.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Failed) {
            notifyListenersFunction.accept(
                PaymentSheetEvents.Failed.getWebEventName(),
                new JSObject().put("message", ((PaymentSheetResult.Failed) paymentSheetResult).getError().getLocalizedMessage())
            );
            notifyListenersFunction.accept(PaymentSheetEvents.Failed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Failed.getWebEventName()));
        } else if (paymentSheetResult instanceof PaymentSheetResult.Completed) {
            notifyListenersFunction.accept(PaymentSheetEvents.Completed.getWebEventName(), emptyObject);
            call.resolve(new JSObject().put("paymentResult", PaymentSheetEvents.Completed.getWebEventName()));
        }
    }
}
