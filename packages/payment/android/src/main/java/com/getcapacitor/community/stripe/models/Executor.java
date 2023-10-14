package com.getcapacitor.community.stripe.models;

import android.app.Activity;
import android.content.Context;

import androidx.core.util.Supplier;

import com.getcapacitor.JSObject;
import com.google.android.gms.common.util.BiConsumer;

public abstract class Executor {

    protected Supplier<Context> contextSupplier;
    protected final Supplier<Activity> activitySupplier;
    protected BiConsumer<String, JSObject> notifyListenersFunction;
    protected final String logTag;

    // Eventually we can change the notification directly here!
    protected void notifyListeners(String eventName, JSObject data) {
        notifyListenersFunction.accept(eventName, data);
    }

    public Executor(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag,
        String executorTag
    ) {
        this.contextSupplier = contextSupplier;
        this.activitySupplier = activitySupplier;
        this.notifyListenersFunction = notifyListenersFunction;
        this.logTag = pluginLogTag + "|" + executorTag;
    }
}
