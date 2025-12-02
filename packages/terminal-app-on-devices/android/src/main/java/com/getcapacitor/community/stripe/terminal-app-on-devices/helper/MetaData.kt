package com.getcapacitor.community.stripe.terminal-app-on-devices.helper

import android.content.Context
import android.content.pm.PackageManager
import androidx.core.util.Supplier
import com.getcapacitor.Logger

class MetaData(protected var contextSupplier: Supplier<Context>) {
    var enableIdentifier: Boolean = false

    init {
        try {
            val appInfo = contextSupplier
                .get()
                .packageManager
                .getApplicationInfo(contextSupplier.get().packageName, PackageManager.GET_META_DATA)

            enableIdentifier =
                appInfo.metaData.getBoolean("com.getcapacitor.community.stripe.enableIdentifier")
        } catch (ignored: Exception) {
            Logger.info("MetaData didn't be prepare fore Google Pay.")
        }
    }
}
