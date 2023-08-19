package com.getcapacitor.community.stripe.terminal;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.util.Supplier;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.terminal.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.TerminalException;
import com.stripe.stripeterminal.log.LogLevel;
import com.stripe.stripeterminal.TerminalApplicationDelegate;

public class StripeTerminal extends Executor {

    public StripeTerminal(
            Supplier<Context> contextSupplier,
            Supplier<Activity> activitySupplier,
            BiConsumer<String, JSObject> notifyListenersFunction,
            String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "VerificationSheetExecutor");
        this.contextSupplier = contextSupplier;
    }

    public void initialize(final PluginCall call) throws TerminalException {
        this.activitySupplier.get().runOnUiThread(() -> {
            TerminalApplicationDelegate.onCreate((Application) this.contextSupplier.get().getApplicationContext());
        });
        TerminalListener listener = new TerminalListener() {
            @Override
            public void onUnexpectedReaderDisconnect(@NonNull Reader reader) {
                // TODO: Listenerを追加
            }

            @Override
            public void onConnectionStatusChange(@NonNull ConnectionStatus status) {
                // TODO: Listenerを追加
            }

            @Override
            public void onPaymentStatusChange(@NonNull PaymentStatus status) {
                // TODO: Listenerを追加
            }
        };
        LogLevel logLevel = LogLevel.VERBOSE;
        TokenProvider tokenProvider = new TokenProvider(this.contextSupplier, call.getString("tokenProviderEndpoint"));
        if (!Terminal.isInitialized()) {
            Terminal.initTerminal(this.contextSupplier.get().getApplicationContext(), logLevel, tokenProvider, listener);
        }
        Terminal.getInstance();
    }
}
