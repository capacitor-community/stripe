package com.getcapacitor.community.stripe.terminal;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.util.Supplier;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.terminal.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.TerminalApplicationDelegate;
import com.stripe.stripeterminal.external.callable.Callback;
import com.stripe.stripeterminal.external.callable.Cancelable;
import com.stripe.stripeterminal.external.callable.DiscoveryListener;
import com.stripe.stripeterminal.external.callable.PaymentIntentCallback;
import com.stripe.stripeterminal.external.callable.ReaderCallback;
import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration;
import com.stripe.stripeterminal.external.models.DiscoveryMethod;
import com.stripe.stripeterminal.external.models.PaymentIntent;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.TerminalException;
import com.stripe.stripeterminal.log.LogLevel;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONException;

public class StripeTerminal extends Executor {

    private Cancelable discoveryCancelable;
    private List<Reader> readers;
    private String locationId;
    private PluginCall collectCall;

    public StripeTerminal(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "StripeTerminalExecutor");
        this.contextSupplier = contextSupplier;
        this.readers = new ArrayList<Reader>();
    }

    public void initialize(final PluginCall call) throws TerminalException {
        this.activitySupplier.get()
            .runOnUiThread(
                () -> {
                    TerminalApplicationDelegate.onCreate((Application) this.contextSupplier.get().getApplicationContext());
                }
            );
        TerminalListener listener = new TerminalListener() {
            @Override
            public void onUnexpectedReaderDisconnect(@NonNull Reader reader) {
                // TODO: Listenerを追加
            }
            //
            //            @Override
            //            public void onConnectionStatusChange(@NonNull ConnectionStatus status) {
            //                // TODO: Listenerを追加
            //            }
            //
            //            @Override
            //            public void onPaymentStatusChange(@NonNull PaymentStatus status) {
            //                // TODO: Listenerを追加
            //            }
        };
        LogLevel logLevel = LogLevel.VERBOSE;
        TokenProvider tokenProvider = new TokenProvider(this.contextSupplier, call.getString("tokenProviderEndpoint"));
        if (!Terminal.isInitialized()) {
            Terminal.initTerminal(this.contextSupplier.get().getApplicationContext(), logLevel, tokenProvider, listener);
        }
        Terminal.getInstance();
    }

    public void onDiscoverReaders(final PluginCall call) {
        this.locationId = call.getString("locationId");
        final DiscoveryConfiguration config = new DiscoveryConfiguration(
            0,
            DiscoveryMethod.LOCAL_MOBILE,
            this.isApplicationDebuggable(),
            call.getString("locationId")
        );
        final DiscoveryListener discoveryListener = readers -> {
            // 検索したReaderの一覧をListenerで渡す
            Log.d(logTag, String.valueOf(readers.get(0).getSerialNumber()));
            this.readers = readers;
            JSArray readersJSObject = new JSArray();

            int i = 0;
            for (Reader reader : this.readers) {
                readersJSObject.put(new JSObject().put("index", String.valueOf(i)).put("serialNumber", reader.getSerialNumber()));
            }
            this.notifyListeners("readers", new JSObject().put("readers", readersJSObject));
            call.resolve(new JSObject().put("readers", readersJSObject));
        };
        discoveryCancelable =
            Terminal
                .getInstance()
                .discoverReaders(
                    config,
                    discoveryListener,
                    // Callback run after connectReader
                    new Callback() {
                        @Override
                        public void onSuccess() {
                            Log.d(logTag, "Finished discovering readers");
                        }

                        @Override
                        public void onFailure(@NonNull TerminalException ex) {
                            Log.d(logTag, ex.getLocalizedMessage());
                        }
                    }
                );
    }

    private boolean isApplicationDebuggable() {
        return 0 != (this.activitySupplier.get().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE);
    }

    public void connectReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        ConnectionConfiguration.LocalMobileConnectionConfiguration config = new ConnectionConfiguration.LocalMobileConnectionConfiguration(
            this.locationId
        );
        Terminal
            .getInstance()
            .connectLocalMobileReader(
                this.readers.get(reader.getInteger("index")),
                config,
                new ReaderCallback() {
                    @Override
                    public void onSuccess(Reader r) {
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException ex) {
                        ex.printStackTrace();
                        call.reject(ex.getLocalizedMessage(), ex);
                    }
                }
            );
    }

    public void cancelDiscovering(final PluginCall call) {
        if (discoveryCancelable != null) {
            discoveryCancelable.cancel(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        call.resolve();
                    }

                    @Override
                    public void onFailure(TerminalException ex) {
                        Log.d(logTag, ex.getLocalizedMessage());
                        call.reject(ex.getLocalizedMessage(), ex);
                    }
                }
            );
        } else {
            call.resolve();
        }
    }

    public void collect(final PluginCall call) {
        // メソッドを分割するためcallを永続化
        this.collectCall = call;

        Terminal
            .getInstance()
            .retrievePaymentIntent(
                call.getString("paymentIntent"),
                createPaymentIntentCallback
            );
    }

    private final PaymentIntentCallback createPaymentIntentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            Terminal.getInstance()
                    .collectPaymentMethod(paymentIntent, collectPaymentMethodCallback);
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            collectCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    // Step 3 - we've collected the payment method, so it's time to process the payment
    private final PaymentIntentCallback collectPaymentMethodCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            Terminal.getInstance().processPayment(paymentIntent, processPaymentCallback);
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            collectCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    // Step 4 - we've processed the payment! Show a success screen
    private final PaymentIntentCallback processPaymentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            collectCall.resolve();
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            collectCall.reject(ex.getLocalizedMessage(), ex);
        }
    };
}
