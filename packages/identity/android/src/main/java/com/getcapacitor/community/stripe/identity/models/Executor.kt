package com.getcapacitor.community.stripe.identity.models

import android.app.Activity
import android.content.Context
import androidx.core.util.Supplier
import com.getcapacitor.JSObject

fun interface EventNotifier {
    fun accept(eventName: String, data: JSObject, retainUntilConsumed: Boolean)

    fun accept(eventName: String, data: JSObject) {
        accept(eventName, data, false)
    }
}

abstract class Executor(
    protected var contextSupplier: Supplier<Context>,
    protected val activitySupplier: Supplier<Activity>,
    protected var notifyListenersFunction: EventNotifier,
    pluginLogTag: String,
    executorTag: String
) {
    protected val logTag: String = "$pluginLogTag|$executorTag"

    protected fun notifyListeners(
        eventName: String,
        data: JSObject,
        retainUntilConsumed: Boolean = false
    ) {
        notifyListenersFunction.accept(eventName, data, retainUntilConsumed)
    }
}
