package com.getcapacitor.community.stripe.terminal;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.util.Supplier;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;
import com.getcapacitor.community.stripe.terminal.helper.TerminalMappers;
import com.getcapacitor.community.stripe.terminal.models.Executor;
import com.google.android.gms.common.util.BiConsumer;
import com.stripe.stripeterminal.Terminal;
import com.stripe.stripeterminal.TerminalApplicationDelegate;
import com.stripe.stripeterminal.external.callable.Callback;
import com.stripe.stripeterminal.external.callable.Cancelable;
import com.stripe.stripeterminal.external.callable.DiscoveryListener;
import com.stripe.stripeterminal.external.callable.InternetReaderListener;
import com.stripe.stripeterminal.external.callable.MobileReaderListener;
import com.stripe.stripeterminal.external.callable.PaymentIntentCallback;
import com.stripe.stripeterminal.external.callable.ReaderCallback;
//import com.stripe.stripeterminal.external.callable.ReaderReconnectionListener;
import com.stripe.stripeterminal.external.callable.TapToPayReaderListener;
import com.stripe.stripeterminal.external.callable.TerminalListener;
import com.stripe.stripeterminal.external.models.BatteryStatus;
import com.stripe.stripeterminal.external.models.CardPresentDetails;
import com.stripe.stripeterminal.external.models.Cart;
import com.stripe.stripeterminal.external.models.CartLineItem;
import com.stripe.stripeterminal.external.models.CollectConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.BluetoothConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.InternetConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionConfiguration.UsbConnectionConfiguration;
import com.stripe.stripeterminal.external.models.ConnectionStatus;
import com.stripe.stripeterminal.external.models.DisconnectReason;
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration;
import com.stripe.stripeterminal.external.models.PaymentIntent;
import com.stripe.stripeterminal.external.models.PaymentMethod;
import com.stripe.stripeterminal.external.models.PaymentStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.ReaderDisplayMessage;
import com.stripe.stripeterminal.external.models.ReaderEvent;
import com.stripe.stripeterminal.external.models.ReaderInputOptions;
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate;
import com.stripe.stripeterminal.external.models.SimulateReaderUpdate;
import com.stripe.stripeterminal.external.models.SimulatedCard;
import com.stripe.stripeterminal.external.models.SimulatedCardType;
import com.stripe.stripeterminal.external.models.SimulatorConfiguration;
import com.stripe.stripeterminal.external.models.TerminalException;
import com.stripe.stripeterminal.log.LogLevel;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.jetbrains.annotations.NotNull;
import org.json.JSONException;
import org.json.JSONObject;

public class StripeTerminal extends Executor {

    private TokenProvider tokenProvider;
    private Cancelable discoveryCancelable;
    private Cancelable collectCancelable;
    private Cancelable installUpdateCancelable;
    private Cancelable cancelReaderConnectionCancellable;
    private List<Reader> discoveredReadersList;
    private String locationId;
    private PluginCall collectCall;
    private PluginCall confirmPaymentIntentCall;
    private final JSObject emptyObject = new JSObject();
    private Boolean isTest;
    private TerminalConnectTypes terminalConnectType;
    private PaymentIntent paymentIntentInstance;

    private final TerminalMappers terminalMappers = new TerminalMappers();

    public StripeTerminal(
        Supplier<Context> contextSupplier,
        Supplier<Activity> activitySupplier,
        BiConsumer<String, JSObject> notifyListenersFunction,
        String pluginLogTag
    ) {
        super(contextSupplier, activitySupplier, notifyListenersFunction, pluginLogTag, "StripeTerminalExecutor");
        this.contextSupplier = contextSupplier;
        this.discoveredReadersList = new ArrayList<>();
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
            public void onConnectionStatusChange(@NonNull ConnectionStatus status) {
                notifyListeners(
                    TerminalEnumEvent.ConnectionStatusChange.getWebEventName(),
                    new JSObject().put("status", status.toString())
                );
            }

            @Override
            public void onPaymentStatusChange(@NonNull PaymentStatus status) {
                notifyListeners(TerminalEnumEvent.PaymentStatusChange.getWebEventName(), new JSObject().put("status", status.toString()));
            }
        };
        LogLevel logLevel = LogLevel.VERBOSE;
        this.tokenProvider =
            new TokenProvider(this.contextSupplier, call.getString("tokenProviderEndpoint", ""), this.notifyListenersFunction);
        if (!Terminal.isInitialized()) {
            Terminal.initTerminal(this.contextSupplier.get().getApplicationContext(), logLevel, this.tokenProvider, listener);
        }
        Terminal.getInstance();
    }

    public void setConnectionToken(PluginCall call) {
        this.tokenProvider.setConnectionToken(call);
    }

    public void setSimulatorConfiguration(PluginCall call) {
        try {
            Terminal
                .getInstance()
                .setSimulatorConfiguration(
                    new SimulatorConfiguration(
                        SimulateReaderUpdate.valueOf(call.getString("update", "UPDATE_AVAILABLE")),
                        new SimulatedCard(SimulatedCardType.valueOf(call.getString("simulatedCard", "VISA"))),
                        call.getLong("simulatedTipAmount", null)
                    )
                );

            call.resolve();
        } catch (Exception ex) {
            call.reject(ex.getMessage());
        }
    }

    public void onDiscoverReaders(final PluginCall call) {
        if (
            ActivityCompat.checkSelfPermission(this.contextSupplier.get(), Manifest.permission.ACCESS_FINE_LOCATION) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            Log.d(this.logTag, "android.permission.ACCESS_FINE_LOCATION permission is not granted.");
            call.reject("android.permission.ACCESS_FINE_LOCATION permission is not granted.");
            return;
        }

        this.locationId = call.getString("locationId");
        final DiscoveryConfiguration config;
        if (Objects.equals(call.getString("type"), TerminalConnectTypes.TapToPay.getWebEventName())) {
            config = new DiscoveryConfiguration.TapToPayDiscoveryConfiguration(this.isTest);
            this.terminalConnectType = TerminalConnectTypes.TapToPay;
        } else if (Objects.equals(call.getString("type"), TerminalConnectTypes.Internet.getWebEventName())) {
            config = new DiscoveryConfiguration.InternetDiscoveryConfiguration(0, this.locationId, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Internet;
        } else if (Objects.equals(call.getString("type"), TerminalConnectTypes.Usb.getWebEventName())) {
            config = new DiscoveryConfiguration.UsbDiscoveryConfiguration(0, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Usb;
        } else if (
            Objects.equals(call.getString("type"), TerminalConnectTypes.Bluetooth.getWebEventName()) ||
            Objects.equals(call.getString("type"), TerminalConnectTypes.Simulated.getWebEventName())
        ) {
            config = new DiscoveryConfiguration.BluetoothDiscoveryConfiguration(0, this.isTest);
            this.terminalConnectType = TerminalConnectTypes.Bluetooth;
        } else {
            call.unimplemented(call.getString("type") + " is not support now");
            return;
        }

        final DiscoveryListener discoveryListener = readers -> {
            // 検索したReaderの一覧をListenerで渡す
            Log.d(logTag, String.valueOf(readers.get(0).getSerialNumber()));
            this.discoveredReadersList = readers;
            JSArray readersJSObject = new JSArray();

            int i = 0;
            for (Reader reader : this.discoveredReadersList) {
                readersJSObject.put(convertReaderInterface(reader).put("index", String.valueOf(i)));
            }
            this.notifyListeners(TerminalEnumEvent.DiscoveredReaders.getWebEventName(), new JSObject().put("readers", readersJSObject));
            call.resolve(new JSObject().put("readers", readersJSObject));
        };
        discoveryCancelable =
            Terminal
                .getInstance()
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
            this.connectTapToPayReader(call);
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
            call.resolve(new JSObject().put("reader", convertReaderInterface(reader)));
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

    private void connectTapToPayReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        String serialNumber = reader.getString("serialNumber");
        this.locationId = call.getString("locationId", this.locationId);

        Reader foundReader = this.findReader(this.discoveredReadersList, serialNumber);

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.");
            return;
        }

        Boolean autoReconnectOnUnexpectedDisconnect = Objects.requireNonNullElse(call.getBoolean("autoReconnectOnUnexpectedDisconnect", false), false);

        ConnectionConfiguration.TapToPayConnectionConfiguration config = new ConnectionConfiguration.TapToPayConnectionConfiguration(
            this.locationId,
            autoReconnectOnUnexpectedDisconnect,
            this.tapToPayReaderListener
        );
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call));
    }

    TapToPayReaderListener tapToPayReaderListener = new TapToPayReaderListener() {
        @Override
        public void onReaderReconnectFailed(@NonNull Reader reader) {
            notifyListeners(
                    TerminalEnumEvent.ReaderReconnectFailed.getWebEventName(),
                    new JSObject().put("reader", convertReaderInterface(reader))
            );
        }

        @Override
        public void onReaderReconnectStarted(@NonNull Reader reader, @NonNull Cancelable cancelReconnect, @NonNull DisconnectReason reason) {
            cancelReaderConnectionCancellable = cancelReconnect;
            notifyListeners(
                    TerminalEnumEvent.ReaderReconnectStarted.getWebEventName(),
                    new JSObject().put("reason", reason.toString()).put("reader", convertReaderInterface(reader))
            );
        }

        @Override
        public void onReaderReconnectSucceeded(@NonNull Reader reader) {
            notifyListeners(
                    TerminalEnumEvent.ReaderReconnectSucceeded.getWebEventName(),
                    new JSObject().put("reader", convertReaderInterface(reader))
            );
        }

        @Override
        public void onDisconnect(@NonNull DisconnectReason reason) {
            notifyListeners(TerminalEnumEvent.DisconnectedReader.getWebEventName(), new JSObject().put("reason", reason.toString()));
        }
    };

    InternetReaderListener internetReaderListener = new InternetReaderListener() {
        @Override
        public void onDisconnect(@NonNull DisconnectReason reason) {
            notifyListeners(TerminalEnumEvent.DisconnectedReader.getWebEventName(), new JSObject().put("reason", reason.toString()));
        }
    };

//    ReaderReconnectionListener readerReconnectionListener = new ReaderReconnectionListener() {
//        @Override
//        public void onReaderReconnectStarted(@NonNull Reader reader, @NonNull Cancelable cancelable, @NonNull DisconnectReason reason) {
//            cancelReaderConnectionCancellable = cancelable;
//            notifyListeners(
//                TerminalEnumEvent.ReaderReconnectStarted.getWebEventName(),
//                new JSObject().put("reason", reason.toString()).put("reader", convertReaderInterface(reader))
//            );
//        }
//
//        @Override
//        public void onReaderReconnectSucceeded(@NonNull Reader reader) {
//            notifyListeners(
//                TerminalEnumEvent.ReaderReconnectSucceeded.getWebEventName(),
//                new JSObject().put("reader", convertReaderInterface(reader))
//            );
//        }
//
//        @Override
//        public void onReaderReconnectFailed(@NonNull Reader reader) {
//            notifyListeners(
//                TerminalEnumEvent.ReaderReconnectFailed.getWebEventName(),
//                new JSObject().put("reader", convertReaderInterface(reader))
//            );
//        }
//    };

    private void connectInternetReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        String serialNumber = reader.getString("serialNumber");
        this.locationId = call.getString("locationId", this.locationId);

        Reader foundReader = this.findReader(this.discoveredReadersList, serialNumber);

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.");
            return;
        }

        InternetConnectionConfiguration config = new InternetConnectionConfiguration(true, this.internetReaderListener);
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call));
    }

    private void connectUsbReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        String serialNumber = reader.getString("serialNumber");
        this.locationId = call.getString("locationId", this.locationId);

        Reader foundReader = this.findReader(this.discoveredReadersList, serialNumber);

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.");
            return;
        }

        UsbConnectionConfiguration config = new UsbConnectionConfiguration(this.locationId, true, this.readerListener());
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call));
    }

    private void connectBluetoothReader(final PluginCall call) {
        JSObject reader = call.getObject("reader");
        String serialNumber = reader.getString("serialNumber");
        this.locationId = call.getString("locationId", this.locationId);

        Reader foundReader = this.findReader(this.discoveredReadersList, serialNumber);

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.");
            return;
        }
        Boolean autoReconnectOnUnexpectedDisconnect = Objects.requireNonNullElse(call.getBoolean("autoReconnectOnUnexpectedDisconnect", false), false);

        BluetoothConnectionConfiguration config = new BluetoothConnectionConfiguration(
            this.locationId,
            autoReconnectOnUnexpectedDisconnect,
            this.readerListener()
        );
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call));
    }

    public void cancelDiscoverReaders(final PluginCall call) {
        if (discoveryCancelable == null || discoveryCancelable.isCompleted()) {
            call.resolve();
            return;
        }
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
    }

    public void collectPaymentMethod(final PluginCall call) {
        String paymentIntent = call.getString("paymentIntent");
        if (paymentIntent == null) {
            call.reject("The value of paymentIntent is not set correctly.");
            return;
        }
        this.collectCall = call;
        Terminal.getInstance().retrievePaymentIntent(paymentIntent, createPaymentIntentCallback);
    }

    public void cancelCollectPaymentMethod(final PluginCall call) {
        if (this.collectCancelable == null || this.collectCancelable.isCompleted()) {
            call.resolve();
            return;
        }

        this.collectCancelable.cancel(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        notifyListeners(TerminalEnumEvent.Canceled.getWebEventName(), emptyObject);
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getLocalizedMessage());
                    }
                }
            );
    }

    private final PaymentIntentCallback createPaymentIntentCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            CollectConfiguration collectConfig = new CollectConfiguration.Builder().updatePaymentIntent(true).build();
            collectCancelable = Terminal.getInstance().collectPaymentMethod(paymentIntent, collectPaymentMethodCallback, collectConfig);
        }

        @Override
        public void onFailure(@NonNull TerminalException exception) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            var returnObject = new JSObject();
            returnObject.put("message", exception.getLocalizedMessage());
            if (exception.getApiError() != null) {
                returnObject.put("code", exception.getApiError().getCode());
                returnObject.put("declineCode", exception.getApiError().getDeclineCode());
            }
            collectCall.reject(exception.getLocalizedMessage(), (String) null, returnObject);
        }
    };

    private final PaymentIntentCallback collectPaymentMethodCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(PaymentIntent paymentIntent) {
            paymentIntentInstance = paymentIntent;
            notifyListeners(TerminalEnumEvent.CollectedPaymentIntent.getWebEventName(), emptyObject);

            PaymentMethod pm = paymentIntent.getPaymentMethod();
            CardPresentDetails card = null;

            if (pm != null) {
                card = pm.getCardPresentDetails() != null ? pm.getCardPresentDetails() : pm.getInteracPresentDetails();
            }

            if (card != null) {
                collectCall.resolve(
                    new JSObject()
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
                collectCall.resolve();
            }
        }

        @Override
        public void onFailure(@NonNull TerminalException exception) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            String errorCode = "generic_error";
            if (exception.getApiError() != null && exception.getApiError().getCode() != null) {
                errorCode = exception.getApiError().getCode();
            }
            var returnObject = new JSObject();
            returnObject.put("message", exception.getLocalizedMessage());
            if (exception.getApiError() != null) {
                returnObject.put("code", exception.getApiError().getCode());
                returnObject.put("declineCode", exception.getApiError().getDeclineCode());
            }
            collectCall.reject(exception.getLocalizedMessage(), errorCode, returnObject);
        }
    };

    public void confirmPaymentIntent(final PluginCall call) {
        if (this.paymentIntentInstance == null) {
            call.reject("PaymentIntent not found for confirmPaymentIntent. Use collect method first and try again.");
            return;
        }

        this.confirmPaymentIntentCall = call;
        Terminal.getInstance().confirmPaymentIntent(this.paymentIntentInstance, confirmPaymentMethodCallback);
    }

    public void installAvailableUpdate(final PluginCall call) {
        Terminal.getInstance().installAvailableUpdate();
        call.resolve(emptyObject);
    }

    public void cancelInstallUpdate(final PluginCall call) {
        if (this.installUpdateCancelable == null || this.installUpdateCancelable.isCompleted()) {
            call.resolve();
            return;
        }

        this.installUpdateCancelable.cancel(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getLocalizedMessage());
                    }
                }
            );
    }

    public void setReaderDisplay(final PluginCall call) {
        String currency = call.getString("currency", null);
        if (currency == null) {
            call.reject("You must provide a currency value");
            return;
        }

        int tax = Objects.requireNonNullElse(call.getInt("tax", 0), 0);
        int total = Objects.requireNonNullElse(call.getInt("total", 0), 0);
        if (total == 0) {
            call.reject("You must provide a total value");
            return;
        }

        JSArray lineItems = call.getArray("lineItems");
        List<JSONObject> lineItemsList;
        try {
            lineItemsList = lineItems.toList();
        } catch (JSONException e) {
            call.reject(e.getLocalizedMessage());
            return;
        }

        List<CartLineItem> cartLineItems = new ArrayList<>();
        for (JSONObject item : lineItemsList) {
            try {
                JSObject itemObj = JSObject.fromJSONObject(item);
                cartLineItems.add(
                    new CartLineItem(
                        Objects.requireNonNull(itemObj.getString("displayName")),
                        Objects.requireNonNull(itemObj.getInteger("quantity")),
                        Objects.requireNonNull(itemObj.getInteger("amount"))
                    )
                );
            } catch (JSONException e) {
                call.reject(e.getLocalizedMessage());
                return;
            }
        }

        Cart cart = new Cart.Builder(currency, tax, total, cartLineItems).build();

        Terminal
            .getInstance()
            .setReaderDisplay(
                cart,
                new Callback() {
                    @Override
                    public void onSuccess() {
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getErrorMessage());
                    }
                }
            );
    }

    public void clearReaderDisplay(final PluginCall call) {
        Terminal
            .getInstance()
            .clearReaderDisplay(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        call.resolve();
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getErrorMessage());
                    }
                }
            );
    }

    public void rebootReader(final PluginCall call) {
        Terminal
            .getInstance()
            .rebootReader(
                new Callback() {
                    @Override
                    public void onSuccess() {
                        paymentIntentInstance = null;
                        call.resolve(emptyObject);
                    }

                    @Override
                    public void onFailure(@NonNull TerminalException e) {
                        call.reject(e.getLocalizedMessage());
                    }
                }
            );
    }

    public void cancelReaderReconnection(final PluginCall call) {
        if (cancelReaderConnectionCancellable == null || cancelReaderConnectionCancellable.isCompleted()) {
            call.resolve();
            return;
        }
        cancelReaderConnectionCancellable.cancel(
            new Callback() {
                @Override
                public void onSuccess() {
                    call.resolve();
                }

                @Override
                public void onFailure(@NonNull TerminalException ex) {
                    call.reject(ex.getLocalizedMessage(), ex);
                }
            }
        );
    }

    private final PaymentIntentCallback confirmPaymentMethodCallback = new PaymentIntentCallback() {
        @Override
        public void onSuccess(@NonNull PaymentIntent paymentIntent) {
            notifyListeners(TerminalEnumEvent.ConfirmedPaymentIntent.getWebEventName(), emptyObject);
            paymentIntentInstance = null;
            confirmPaymentIntentCall.resolve();
        }

        @Override
        public void onFailure(TerminalException exception) {
            notifyListeners(TerminalEnumEvent.Failed.getWebEventName(), emptyObject);
            var returnObject = new JSObject();
            returnObject.put("message", exception.getLocalizedMessage());
            if (exception.getApiError() != null) {
                returnObject.put("code", exception.getApiError().getCode());
                returnObject.put("declineCode", exception.getApiError().getDeclineCode());
            }
            confirmPaymentIntentCall.reject(exception.getLocalizedMessage(), (String) null, returnObject);
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

    private MobileReaderListener readerListener() {
        return new MobileReaderListener() {
            @Override
            public void onStartInstallingUpdate(@NotNull ReaderSoftwareUpdate update, @NotNull Cancelable cancelable) {
                // Show UI communicating that a required update has started installing
                installUpdateCancelable = cancelable;
                notifyListeners(
                    TerminalEnumEvent.StartInstallingUpdate.getWebEventName(),
                    new JSObject().put("update", convertReaderSoftwareUpdate(update))
                );
            }

            @Override
            public void onReportReaderSoftwareUpdateProgress(float progress) {
                // Update the progress of the install
                notifyListeners(TerminalEnumEvent.ReaderSoftwareUpdateProgress.getWebEventName(), new JSObject().put("progress", progress));
            }

            @Override
            public void onFinishInstallingUpdate(@Nullable ReaderSoftwareUpdate update, @Nullable TerminalException error) {
                JSObject eventObject = new JSObject();

                if (error != null) {
                    // note: Since errorCode cannot be obtained in iOS, use errorMessage for unification.
                    eventObject.put("error", error.getLocalizedMessage());
                    notifyListeners(TerminalEnumEvent.FinishInstallingUpdate.getWebEventName(), eventObject);
                    return;
                }

                eventObject.put("update", update == null ? null : convertReaderSoftwareUpdate(update));
                notifyListeners(TerminalEnumEvent.FinishInstallingUpdate.getWebEventName(), eventObject);
            }

            @Override
            public void onBatteryLevelUpdate(float batteryLevel, @NonNull BatteryStatus batteryStatus, boolean isCharging) {
                notifyListeners(
                    TerminalEnumEvent.BatteryLevel.getWebEventName(),
                    new JSObject().put("level", batteryLevel).put("charging", isCharging).put("status", batteryStatus.toString())
                );
            }

            @Override
            public void onReportLowBatteryWarning() {}

            @Override
            public void onReportAvailableUpdate(@NotNull ReaderSoftwareUpdate update) {
                // An update is available for the connected reader. Show this update in your application.
                // This update can be installed using `Terminal.getInstance().installAvailableUpdate`.
                notifyListeners(
                    TerminalEnumEvent.ReportAvailableUpdate.getWebEventName(),
                    new JSObject().put("update", convertReaderSoftwareUpdate(update))
                );
            }

            @Override
            public void onReportReaderEvent(@NotNull ReaderEvent event) {
                notifyListeners(TerminalEnumEvent.ReaderEvent.getWebEventName(), new JSObject().put("event", event.toString()));
            }

            @Override
            public void onRequestReaderDisplayMessage(@NotNull ReaderDisplayMessage message) {
                notifyListeners(
                    TerminalEnumEvent.RequestDisplayMessage.getWebEventName(),
                    new JSObject().put("messageType", message.name()).put("message", message.toString())
                );
            }

            @Override
            public void onRequestReaderInput(@NotNull ReaderInputOptions options) {
                List<ReaderInputOptions.ReaderInputOption> optionsList = options.getOptions();
                JSArray jsOptions = new JSArray();
                for (ReaderInputOptions.ReaderInputOption optionType : optionsList) {
                    jsOptions.put(optionType.name());
                }

                notifyListeners(
                    TerminalEnumEvent.RequestReaderInput.getWebEventName(),
                    new JSObject().put("options", jsOptions).put("message", options.toString())
                );
            }

            public void onDisconnect(@NotNull DisconnectReason reason) {
                notifyListeners(TerminalEnumEvent.DisconnectedReader.getWebEventName(), new JSObject().put("reason", reason.toString()));
            }
        };
    }

    private JSObject convertReaderInterface(Reader reader) {
        return new JSObject()
            .put("label", reader.getLabel())
            .put("serialNumber", reader.getSerialNumber())
            .put("id", reader.getId())
            .put("locationId", reader.getLocation() != null ? reader.getLocation().getId() : null)
            .put("deviceSoftwareVersion", reader.getDeviceSwVersion$public_release())
            .put("simulated", reader.isSimulated())
            .put("serialNumber", reader.getSerialNumber())
            .put("ipAddress", reader.getIpAddress())
            .put("baseUrl", reader.getBaseUrl())
            .put("bootloaderVersion", reader.getBootloaderVersion())
            .put("configVersion", reader.getConfigVersion())
            .put("emvKeyProfileId", reader.getEmvKeyProfileId())
            .put("firmwareVersion", reader.getFirmwareVersion())
            .put("hardwareVersion", reader.getHardwareVersion())
            .put("macKeyProfileId", reader.getMacKeyProfileId())
            .put("pinKeyProfileId", reader.getPinKeyProfileId())
            .put("trackKeyProfileId", reader.getTrackKeyProfileId())
            .put("settingsVersion", reader.getSettingsVersion())
            .put("pinKeysetId", reader.getPinKeysetId())
            .put("deviceType", terminalMappers.mapFromDeviceType(reader.getDeviceType()))
            .put("status", terminalMappers.mapFromNetworkStatus(reader.getNetworkStatus()))
            .put("locationStatus", terminalMappers.mapFromLocationStatus(reader.getLocationStatus()))
            .put("batteryLevel", reader.getBatteryLevel() != null ? reader.getBatteryLevel().doubleValue() : null)
            .put("availableUpdate", terminalMappers.mapFromReaderSoftwareUpdate(reader.getAvailableUpdate()))
            .put("location", terminalMappers.mapFromLocation(reader.getLocation()));
    }

    private JSObject convertReaderSoftwareUpdate(ReaderSoftwareUpdate update) {
        return terminalMappers.mapFromReaderSoftwareUpdate(update);
    }

    private Reader findReader(List<Reader> discoveredReadersList, String serialNumber) {
        Reader foundReader =
                null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            foundReader = discoveredReadersList.stream()
                    .filter(device -> serialNumber != null && serialNumber.equals(device.getSerialNumber()))
                    .findFirst()
                    .orElse(null);
        } else {
            for (Reader device : discoveredReadersList) {
                if (serialNumber != null && serialNumber.equals(device.getSerialNumber())) {
                    foundReader = device;
                    break;
                }
            }
        }

        return foundReader;
    }
}
