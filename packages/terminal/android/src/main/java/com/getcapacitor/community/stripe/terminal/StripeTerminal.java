package com.getcapacitor.community.stripe.terminal;

import android.app.Activity;
import android.app.Application;
import android.content.Context;

import androidx.annotation.NonNull;
import androidx.core.util.Supplier;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.terminal.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.external.callable.Callback;
import com.stripe.stripeterminal.external.callable.Cancelable;
import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration;
import com.stripe.stripeterminal.external.models.DiscoveryMethod;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.TerminalException;
import com.stripe.stripeterminal.log.LogLevel;
import com.stripe.stripeterminal.TerminalApplicationDelegate;

public class StripeTerminal extends Executor {
    private Cancelable discoveryCancelable;

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

    public void onDiscoverReaders(final PluginCall call) {
        DiscoveryConfiguration config = new DiscoveryConfiguration(
                0,
                DiscoveryMethod.LOCAL_MOBILE,
                this.isApplicationDebuggable(),
                call.getString("locationId")
        );
        // Save this cancelable to an instance variable
        discoveryCancelable = Terminal.getInstance().discoverReaders(config, readers -> {
            // Automatically connect to supported mobile readers
        }, new Callback() {
            @Override
            public void onSuccess() {
                call.resolve();
            }

            @Override
            public void onFailure(TerminalException ex) {
                call.reject(ex.getLocalizedMessage(), ex);
            }
        });
    }

    private boolean isApplicationDebuggable() {
        return 0 != ( this.activitySupplier.get().getApplicationInfo().flags & this.activitySupplier.get().getApplicationInfo().FLAG_DEBUGGABLE );
    }

    public void cancelDiscovering(final PluginCall call) {
        if (discoveryCancelable != null) {
            discoveryCancelable.cancel(new Callback() {
                @Override
                public void onSuccess() {
                    call.resolve();
                }

                @Override
                public void onFailure(TerminalException ex) {
                    call.reject(ex.getLocalizedMessage(), ex);
                }
            });
        } else {
            call.resolve();
        }
    }
}
