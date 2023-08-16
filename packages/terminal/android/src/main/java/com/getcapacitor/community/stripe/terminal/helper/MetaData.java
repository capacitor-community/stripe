package com.getcapacitor.community.stripe.identity.helper;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import androidx.core.util.Supplier;

import com.getcapacitor.Logger;

public class MetaData {

    protected Supplier<Context> contextSupplier;

    public boolean enableIdentifier;

    public MetaData(Supplier<Context> contextSupplier) {
        this.contextSupplier = contextSupplier;
        try {
            ApplicationInfo appInfo = contextSupplier
                .get()
                .getPackageManager()
                .getApplicationInfo(contextSupplier.get().getPackageName(), PackageManager.GET_META_DATA);

            enableIdentifier = appInfo.metaData.getBoolean("com.getcapacitor.community.stripe.enableIdentifier");
        } catch (Exception ignored) {
            Logger.info("MetaData didn't be prepare fore Google Pay.");
        }
    }
}
