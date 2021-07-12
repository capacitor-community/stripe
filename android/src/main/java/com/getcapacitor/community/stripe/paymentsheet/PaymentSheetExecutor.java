package com.getcapacitor.community.stripe.paymentsheet;

import android.app.Activity;
import android.content.Context;
import androidx.core.util.Supplier;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.google.android.gms.common.util.BiConsumer;

import com.getcapacitor.community.stripe.models.Executor;

public class PaymentSheetExecutor extends Executor {

    private final JSObject emptyObject = new JSObject();

    public PaymentSheetExecutor(
            Supplier<Context> contextSupplier,
            Supplier<Activity> activitySupplier,
            BiConsumer<String, JSObject> notifyListenersFunction,
            String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "GooglePayExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void createPaymentSheet(final PluginCall call) {
    }

    public void presentPaymentSheet(final PluginCall call) {
    }
}
