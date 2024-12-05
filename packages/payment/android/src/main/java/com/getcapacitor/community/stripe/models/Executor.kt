package com.getcapacitor.community.stripe.models

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.JSObject
import com.google.android.gms.common.util.BiConsumer

abstract class Executor(
    protected var contextSupplier: Supplier<Context>,
    protected val activitySupplier: Supplier<Activity>,
    protected var notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String,
    executorTag: String
) {
    protected val logTag: String = "$pluginLogTag|$executorTag"

    // Eventually we can change the notification directly here!
    protected fun notifyListeners(eventName: String, data: JSObject) {
        notifyListenersFunction.accept(eventName, data)
    }
}
