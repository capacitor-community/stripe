package com.getcapacitor.community.stripe.terminal;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
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
import com.stripe.stripeterminal.external.callable.SetupIntentCallback;
import com.stripe.stripeterminal.external.callable.ReaderCallback;
import com.stripe.stripeterminal.external.callable.ReaderListener;
import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.CardPresentDetails;
import com.stripe.stripeterminal.external.models.CollectConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.BluetoothConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.InternetConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.LocalMobileConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.UsbConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration;
import com.stripe.stripeterminal.external.models.PaymentIntent;
import com.stripe.stripeterminal.external.models.SetupIntent;
import com.stripe.stripeterminal.external.models.PaymentMethod;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate;
import com.stripe.stripeterminal.external.models.TerminalException;
import com.stripe.stripeterminal.log.LogLevel;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class StripeTerminal extends Executor {

    private Cancelable discoveryCancelable;
    private Cancelable collectPaymentCancelable;
    private List<Reader> readers;
    private String locationId;
    private PluginCall collectPaymentCall;
    private PluginCall collectPaymentMethodCall;
    private final JSObject emptyObject = new JSObject();
    private Boolean isTest;
    private TerminalConnectTypes terminalConnectType;

    public StripeTerminal(
            Supplier<Context> contextSupplier,
            Supplier<Activity> activitySupplier,
            BiConsumer<String, JSObject> notifyListenersFunction,
            String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "StripeTerminalExecutor");
        this.contextSupplier = contextSupplier;
        this.readers = new ArrayList<>();
    }

    public void initialize(final PluginCall call) throws TerminalException {
        this.isTest = call.getBoolean("isTest", true);

        BluetoothAdapter bluetooth = BluetoothAdapter.getDefaultAdapter();
        if (!bluetooth.isEnabled()) {
            if (
                    ActivityCompat.checkSelfPermission(this.contextSupplier.get(), Manifest.permission.BLUETOOTH_CONNECT) ==
                            PackageManager.PERMISSION_GRANTED
            ) {
                bluetooth.enable();
            }
        }

        this.activitySupplier.get()
                .runOnUiThread(
                        () -> {
                            TerminalApplicationDelegate.onCreate((Application) this.contextSupplier.get().getApplicationContext());
                            notifyListeners(TerminalEnumEvent.Loaded.getWebEventName(), emptyObject);
                            call.resolve();
                        }
                );
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

    public void onDiscoverReaders(final PluginCall call)  {
        if (ActivityCompat.checkSelfPermission(this.contextSupplier.get(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.d(this.logTag, "android.permission.ACCESS_FINE_LOCATION permission is not granted.");
            call.reject("android.permission.ACCESS_FINE_LOCATION permission is not granted.");
            return;
        }

        this.locationId = call.getString("locationId");
        final DiscoveryConfiguration config;
        if (Objects.equals(call.getString("type"), TerminalConnectTypes.TapToPay.getWebEventName())) {
            config = new DiscoveryConfiguration.LocalMobileDiscoveryConfiguration(this.isTest);
            this.terminalConnectType = TerminalConnectTypes.TapToPay;
        } else if (Objects.equals(call.getString("type"), TerminalConnectTypes.Internet.getWebEventName())) {
            config = new DiscoveryConfiguration.InternetDiscoveryConfiguration(this.locationId, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Internet;
        } else if (Objects.equals(call.getString("type"), TerminalConnectTypes.Usb.getWebEventName())) {
            config = new DiscoveryConfiguration.UsbDiscoveryConfiguration(0, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Usb;
        } else if (Objects.equals(call.getString("type"), TerminalConnectTypes.Bluetooth.getWebEventName()) || Objects.equals(call.getString("type"), TerminalConnectTypes.Simulated.getWebEventName())) {
            config = new DiscoveryConfiguration.BluetoothDiscoveryConfiguration(0, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Bluetooth;
        } else {
            call.unimplemented(call.getString("type") + " is not support now");
            return;
        }

        final DiscoveryListener discoveryListener = readers -> {
            // 検索したReaderの一覧をListenerで渡す
            Log.d(logTag, String.valueOf(readers.get(0).getSerialNumber()));
            this.readers = readers;
            JSArray readersJSObject = new JSArray();

            int i = 0;
            for (Reader reader : this.readers) {
                readersJSObject.put(new JSObject().put("index", String.valueOf(i)).put("serialNumber", reader.getSerialNumber()));
            }
            this.notifyListeners(TerminalEnumEvent.DiscoveredReaders.getWebEventName(), new JSObject().put("readers", readersJSObject));
            call.resolve(new JSObject().put("readers", readersJSObject));
        };
        discoveryCancelable =
                Terminal.getInstance()
                        .discoverReaders(
                                config,
                                discoveryListener,
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

    public void connectReader(final PluginCall call) {
        if (this.terminalConnectType == TerminalConnectTypes.TapToPay) {
            this.connectLocalMobileReader(call);
        } else if (this.terminalConnectType == TerminalConnectTypes.Internet) {
            this.connectInternetReader(call);
        } else if (this.terminalConnectType == TerminalConnectTypes.Usb) {
            this.connectUsbReader(call);
        } else if (this.terminalConnectType == TerminalConnectTypes.Bluetooth) {
            this.connectBluetoothReader(call);
        } else {
            call.reject("type is not defined.");
        }
    }

    public void getConnectedReader(final PluginCall call) {
        Reader reader = Terminal.getInstance().getConnectedReader();
        if (reader == null) {
            call.resolve(new JSObject().put("reader", JSObject.NULL));
        } else {
            call.resolve(new JSObject().put("reader", new JSObject().put("serialNumber", reader.getSerialNumber())));
        }
    }

    public void disconnectReader(final PluginCall call) {
        if (Terminal.getInstance().getConnectedReader() == null) {
            call.resolve();
            return;
        }

        Terminal
            .getInstance()
            .disconnectReader(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        notifyListeners(TerminalEnumEvent.DisconnectedReader.getWebEventName(), emptyObject);
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException ex) {
                        call.reject(ex.getLocalizedMessage(), ex);
                    }
                }
            );
    }

    private void connectLocalMobileReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");

        if (reader.getInteger("index") == null) {
            call.reject("The reader value is not set correctly.");
            return;
        }

        LocalMobileConnectionConfiguration config = new LocalMobileConnectionConfiguration(
            this.locationId
        );
        Terminal
            .getInstance()
            .connectLocalMobileReader(
                this.readers.get(reader.getInteger("index")),
                config,
                this.readerCallback(call)
            );
    }

    private void connectInternetReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        InternetConnectionConfiguration config = new InternetConnectionConfiguration();
        Terminal
            .getInstance()
            .connectInternetReader(
                this.readers.get(reader.getInteger("index")),
                config,
                this.readerCallback(call)
            );
    }

    private void connectUsbReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        UsbConnectionConfiguration config = new UsbConnectionConfiguration(this.locationId);
        Terminal
                .getInstance()
                .connectUsbReader(
                        this.readers.get(reader.getInteger("index")),
                        config,
                        this.readerListener(),
                        this.readerCallback(call)
                );
    }

    private void connectBluetoothReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        BluetoothConnectionConfiguration config = new BluetoothConnectionConfiguration(this.locationId);
        Terminal
                .getInstance()
                .connectBluetoothReader(
                        this.readers.get(reader.getInteger("index")),
                        config,
                        this.readerListener(),
                        this.readerCallback(call)
                );
    }

    public void cancelDiscoverReaders(final PluginCall call) {
        if (discoveryCancelable != null) {
            discoveryCancelable.cancel(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        notifyListeners(TerminalEnumEvent.CancelDiscoveredReaders.getWebEventName(), emptyObject);
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException ex) {
                        call.reject(ex.getLocalizedMessage(), ex);
                    }
                }
            );
        } else {
            call.resolve();
        }
    }

    public void collectPaymentMethod(final PluginCall call) {
        if (call.getString("setupIntent") == null) {
            call.reject("The value of setupIntent is not set correctly.");
            return;
        }
        this.collectPaymentMethodCall = call;
        // Terminal.getInstance().retrievePaymentIntent(call.getString("paymentIntent"), createPaymentIntentCallback);
        Terminal.getInstance().collectSetupIntentPaymentMethod(call.getString("setupIntent"), true, collectSetupIntentPaymentMethodCallback);

    }

    private final SetupIntentCallback collectSetupIntentPaymentMethodCallback = new SetupIntentCallback() {
        @Override
        public void onSuccess(@NonNull SetupIntent setupIntent) {
            Terminal.getInstance().confirmSetupIntent(setupIntent, confirmSetupIntentCallback);
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            collectPaymentMethodCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    private final SetupIntentCallback confirmSetupIntentCallback = new SetupIntentCallback() {
        @Override
        public void onSuccess(@NonNull SetupIntent setupIntent) {
            this.collectPaymentMethodCall.resolve()
            notifyListeners(TerminalEnumEvent.Completed.getWebEventName(), emptyObject);
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            collectPaymentMethodCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    public void collectPayment(final PluginCall call) {
        if (call.getString("paymentIntent") == null) {
            call.reject("The value of paymentIntent is not set correctly.");
            return;
        }
        this.collectPaymentCall = call;
        Terminal.getInstance().retrievePaymentIntent(call.getString("paymentIntent"), createPaymentIntentCallback);
    }

    public void cancelCollect(final PluginCall call) {
        if (this.collectPaymentCancelable == null || this.collectPaymentCancelable.isCompleted()) {
            call.resolve();
            return;
        }

        this.collectPaymentCancelable.cancel(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        collectPaymentCancelable = null;
                        notifyListeners(TerminalEnumEvent.Canceled.getWebEventName(), emptyObject);
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getErrorMessage());
                    }
                }
            );
    }

    private final PaymentIntentCallback createPaymentIntentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            CollectConfiguration collectConfig = new CollectConfiguration.Builder()
                    .updatePaymentIntent(true)
                    .build();
            collectPaymentCancelable = Terminal.getInstance().collectPaymentMethod(paymentIntent, collectPaymentMethodCallback, collectConfig);
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            collectPaymentCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    // Step 3 - we've collected the payment method, so it's time to process the payment
    private final PaymentIntentCallback collectPaymentMethodCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(PaymentIntent paymentIntent) {
            collectPaymentCancelable = null;
            notifyListeners(TerminalEnumEvent.Completed.getWebEventName(), emptyObject);

            PaymentMethod pm = paymentIntent.getPaymentMethod();
            CardPresentDetails card = pm.getCardPresentDetails() != null
                    ? pm.getCardPresentDetails()
                    : pm.getInteracPresentDetails();

            if (card != null) {
                collectPaymentCall.resolve(new JSObject()
                        .put("brand", card.getBrand())
                        .put("cardholderName", card.getCardholderName())
                        .put("country", card.getCountry())
                        .put("emvAuthData", card.getEmvAuthData())
                        .put("expMonth", card.getExpMonth())
                        .put("expYear", card.getExpYear())
                        .put("funding", card.getFunding())
                        .put("generatedCard", card.getGeneratedCard())
                        .put("incrementalAuthorizationStatus", card.getIncrementalAuthorizationStatus())
                        .put("last4", card.getLast4())
                        .put("networks", card.getNetworks())
                        .put("readMethod", card.getReadMethod())

                );
            } else {
                collectPaymentCall.resolve();
            }
        }

        @Override
        public void onFailure(@NonNull TerminalException ex) {
            collectPaymentCancelable = null;
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            collectPaymentCall.reject(ex.getLocalizedMessage(), ex);
        }
    };

    private ReaderCallback readerCallback(final PluginCall call) {
        return new ReaderCallback() {
            @Override
            public void onSuccess(@NonNull Reader r) {
                notifyListeners(TerminalEnumEvent.ConnectedReader.getWebEventName(), emptyObject);
                call.resolve();
            }

            @Override
            public void onFailure(@NonNull TerminalException ex) {
                ex.printStackTrace();
                call.reject(ex.getLocalizedMessage(), ex);
            }
        };
    }

    private ReaderListener readerListener() {
        return new ReaderListener() {
            @Override
            public void onStartInstallingUpdate(@NotNull ReaderSoftwareUpdate update, @NotNull Cancelable cancelable) {
                // Show UI communicating that a required update has started installing
            }

            @Override
            public void onReportReaderSoftwareUpdateProgress(float progress) {
                // Update the progress of the install
            }

            @Override
            public void onFinishInstallingUpdate(@Nullable ReaderSoftwareUpdate update, @Nullable TerminalException e) {
                // Report success or failure of the update
            }

            @Override
            public void onReportLowBatteryWarning() {

            }

            @Override
            public void onReportAvailableUpdate(@NotNull ReaderSoftwareUpdate update) {
                // An update is available for the connected reader. Show this update in your application.
                // This update can be installed using `Terminal.getInstance().installAvailableUpdate`.
            }
        };
    }
}
