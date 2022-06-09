package com.getcapacitor.community.stripe.helper;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import androidx.core.util.Supplier;
import com.getcapacitor.Logger;
import com.stripe.android.googlepaylauncher.GooglePayEnvironment;

public class MetaData {

    protected Supplier<Context> contextSupplier;
    public boolean enableGooglePay;
    public String publishableKey;
    public String countryCode;
    public String displayName;
    public String stripeAccount;
    public GooglePayEnvironment googlePayEnvironment;

    public MetaData(Supplier<Context> contextSupplier) {
        this.contextSupplier = contextSupplier;
        try {
            ApplicationInfo appInfo = contextSupplier
                .get()
                .getPackageManager()
                .getApplicationInfo(contextSupplier.get().getPackageName(), PackageManager.GET_META_DATA);

            enableGooglePay = appInfo.metaData.getBoolean("com.getcapacitor.community.stripe.enable_google_pay");
            publishableKey = appInfo.metaData.getString("com.getcapacitor.community.stripe.publishable_key");
            countryCode = appInfo.metaData.getString("com.getcapacitor.community.stripe.country_code");
            displayName = appInfo.metaData.getString("com.getcapacitor.community.stripe.merchant_display_name");
            stripeAccount = appInfo.metaData.getString("com.getcapacitor.community.stripe.stripe_account");

            boolean isTest = appInfo.metaData.getBoolean("com.getcapacitor.community.stripe.google_pay_is_testing");
            if (isTest) {
                googlePayEnvironment = GooglePayEnvironment.Test;
            } else {
                googlePayEnvironment = GooglePayEnvironment.Production;
            }
        } catch (Exception ignored) {
            Logger.info("MetaData didn't be prepare fore Google Pay.");
        }
    }
}
