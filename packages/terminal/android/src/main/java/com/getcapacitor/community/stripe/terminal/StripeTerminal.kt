package com.getcapacitor.community.stripe.terminal

import android.Manifest
import android.app.Activity
import android.app.Application
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.util.Supplier
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.community.stripe.terminal.helper.TerminalMappers
import com.getcapacitor.community.stripe.terminal.models.Executor
import com.google.android.gms.common.util.BiConsumer
import com.stripe.stripeterminal.Terminal
import com.stripe.stripeterminal.Terminal.Companion.initTerminal
import com.stripe.stripeterminal.Terminal.Companion.isInitialized
import com.stripe.stripeterminal.TerminalApplicationDelegate.onCreate
import com.stripe.stripeterminal.external.callable.Callback
import com.stripe.stripeterminal.external.callable.Cancelable
import com.stripe.stripeterminal.external.callable.DiscoveryListener
import com.stripe.stripeterminal.external.callable.InternetReaderListener
import com.stripe.stripeterminal.external.callable.MobileReaderListener
import com.stripe.stripeterminal.external.callable.PaymentIntentCallback
import com.stripe.stripeterminal.external.callable.ReaderCallback
import com.stripe.stripeterminal.external.callable.TapToPayReaderListener
import com.stripe.stripeterminal.external.callable.TerminalListener
import com.stripe.stripeterminal.external.models.BatteryStatus
import com.stripe.stripeterminal.external.models.CardPresentDetails
import com.stripe.stripeterminal.external.models.Cart
import com.stripe.stripeterminal.external.models.CartLineItem
import com.stripe.stripeterminal.external.models.CollectConfiguration
import com.stripe.stripeterminal.external.models.ConnectionConfiguration
import com.stripe.stripeterminal.external.models.ConnectionStatus
import com.stripe.stripeterminal.external.models.DisconnectReason
import com.stripe.stripeterminal.external.models.DiscoveryConfiguration
import com.stripe.stripeterminal.external.models.PaymentIntent
import com.stripe.stripeterminal.external.models.PaymentStatus
import com.stripe.stripeterminal.external.models.Reader
import com.stripe.stripeterminal.external.models.ReaderDisplayMessage
import com.stripe.stripeterminal.external.models.ReaderEvent
import com.stripe.stripeterminal.external.models.ReaderInputOptions
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate
import com.stripe.stripeterminal.external.models.SimulateReaderUpdate
import com.stripe.stripeterminal.external.models.SimulatedCard
import com.stripe.stripeterminal.external.models.SimulatorConfiguration
import com.stripe.stripeterminal.external.models.TerminalException
import com.stripe.stripeterminal.log.LogLevel
import org.json.JSONException
import org.json.JSONObject
import java.util.Objects

//import com.stripe.stripeterminal.external.callable.ReaderReconnectionListener;
class StripeTerminal(
    contextSupplier: Supplier<Context?>,
    activitySupplier: Supplier<Activity>,
    notifyListenersFunction: BiConsumer<String, JSObject>,
    pluginLogTag: String
) : Executor(
    contextSupplier,
    activitySupplier,
    notifyListenersFunction,
    pluginLogTag,
    "StripeTerminalExecutor"
) {
    private var tokenProvider: TokenProvider? = null
    private var discoveryCancelable: Cancelable? = null
    private var collectCancelable: Cancelable? = null
    private var installUpdateCancelable: Cancelable? = null
    private var cancelReaderConnectionCancellable: Cancelable? = null
    private var discoveredReadersList: List<Reader?>
    private var locationId: String? = null
    private var collectCall: PluginCall? = null
    private var confirmPaymentIntentCall: PluginCall? = null
    private val emptyObject = JSObject()
    private var isTest: Boolean? = null
    private var terminalConnectType: TerminalConnectTypes? = null
    private var paymentIntentInstance: PaymentIntent? = null

    private val terminalMappers = TerminalMappers()

    @Throws(TerminalException::class)
    fun initialize(call: PluginCall) {
        this.isTest = call.getBoolean("isTest", true)

        val bluetooth = BluetoothAdapter.getDefaultAdapter()
        if (!bluetooth.isEnabled) {
            if (ActivityCompat.checkSelfPermission(
                    contextSupplier.get()!!,
                    Manifest.permission.BLUETOOTH_CONNECT
                ) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                bluetooth.enable()
            }
        }

        activitySupplier.get()
            .runOnUiThread {
                onCreate((contextSupplier.get()!!.applicationContext as Application))
                notifyListeners(TerminalEnumEvent.Loaded.webEventName, emptyObject)
                call.resolve()
            }
        val listener: TerminalListener = object : TerminalListener {
            override fun onConnectionStatusChange(status: ConnectionStatus) {
                notifyListeners(
                    TerminalEnumEvent.ConnectionStatusChange.webEventName,
                    JSObject().put("status", status.toString())
                )
            }

            override fun onPaymentStatusChange(status: PaymentStatus) {
                notifyListeners(
                    TerminalEnumEvent.PaymentStatusChange.webEventName,
                    JSObject().put("status", status.toString())
                )
            }
        }
        val logLevel = LogLevel.VERBOSE
        this.tokenProvider = TokenProvider(
            this.contextSupplier,
            call.getString("tokenProviderEndpoint", ""),
            this.notifyListenersFunction
        )
        if (!isInitialized()) {
            initTerminal(
                contextSupplier.get()!!.applicationContext,
                logLevel,
                this.tokenProvider!!,
                listener
            )
        }
        Terminal.getInstance()
    }

    fun setConnectionToken(call: PluginCall) {
        tokenProvider!!.setConnectionToken(call)
    }

    fun setSimulatorConfiguration(call: PluginCall) {
        try {
            val updateString = call.getString("update", "UPDATE_AVAILABLE")
            val simulateReaderUpdate = SimulateReaderUpdate.values().find { it.name == updateString }

            Terminal.getInstance()
                .simulatorConfiguration = SimulatorConfiguration(
                simulateReaderUpdate!!,
                SimulatedCard(call.getString("simulatedCard", "VISA")!!),
                call.getLong("simulatedTipAmount", null),
                false
            )


            call.resolve()
        } catch (ex: Exception) {
            call.reject(ex.message)
        }
    }

    fun onDiscoverReaders(call: PluginCall) {
        if (ActivityCompat.checkSelfPermission(
                contextSupplier.get()!!,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            Log.d(this.logTag, "android.permission.ACCESS_FINE_LOCATION permission is not granted.")
            call.reject("android.permission.ACCESS_FINE_LOCATION permission is not granted.")
            return
        }

        this.locationId = call.getString("locationId")
        val config: DiscoveryConfiguration
        if (call.getString("type") == TerminalConnectTypes.TapToPay.webEventName) {
            config = DiscoveryConfiguration.TapToPayDiscoveryConfiguration(this.isTest!!)
            this.terminalConnectType = TerminalConnectTypes.TapToPay
        } else if (call.getString("type") == TerminalConnectTypes.Internet.webEventName) {
            config = DiscoveryConfiguration.InternetDiscoveryConfiguration(
                0,
                this.locationId,
                this.isTest!!
            )
            this.terminalConnectType = TerminalConnectTypes.Internet
        } else if (call.getString("type") == TerminalConnectTypes.Usb.webEventName) {
            config = DiscoveryConfiguration.UsbDiscoveryConfiguration(0, this.isTest!!)
            this.terminalConnectType = TerminalConnectTypes.Usb
        } else if (call.getString("type") == TerminalConnectTypes.Bluetooth.webEventName || call.getString(
                "type"
            ) == TerminalConnectTypes.Simulated.webEventName
        ) {
            config = DiscoveryConfiguration.BluetoothDiscoveryConfiguration(0, this.isTest!!)
            this.terminalConnectType = TerminalConnectTypes.Bluetooth
        } else {
            call.unimplemented(call.getString("type") + " is not support now")
            return
        }

        discoveryCancelable = Terminal.getInstance()
            .discoverReaders(
                config,
                object : DiscoveryListener {
                    override fun onUpdateDiscoveredReaders(readers: List<Reader>) {
                        Log.d(logTag, readers[0].serialNumber.toString())
                        discoveredReadersList = readers
                        val readersJSObject = JSArray()

                        val i = 0
                        for (reader in discoveredReadersList) {
                            readersJSObject.put(convertReaderInterface(reader).put("index", i.toString()))
                        }
                        notifyListeners(
                            TerminalEnumEvent.DiscoveredReaders.webEventName,
                            JSObject().put("readers", readersJSObject)
                        )
                        call.resolve(JSObject().put("readers", readersJSObject))
                    }
                },
                object : Callback {
                    override fun onSuccess() {
                        Log.d(logTag, "Finished discovering readers")
                    }

                    override fun onFailure(ex: TerminalException) {
                        Log.d(logTag, ex.localizedMessage)
                    }
                }
            )
    }

    fun connectReader(call: PluginCall) {
        if (this.terminalConnectType == TerminalConnectTypes.TapToPay) {
            this.connectTapToPayReader(call)
        } else if (this.terminalConnectType == TerminalConnectTypes.Internet) {
            this.connectInternetReader(call)
        } else if (this.terminalConnectType == TerminalConnectTypes.Usb) {
            this.connectUsbReader(call)
        } else if (this.terminalConnectType == TerminalConnectTypes.Bluetooth) {
            this.connectBluetoothReader(call)
        } else {
            call.reject("type is not defined.")
        }
    }

    fun getConnectedReader(call: PluginCall) {
        val reader: Reader? = Terminal.getInstance().connectedReader
        if (reader == null) {
            call.resolve(JSObject().put("reader", JSObject.NULL))
        } else {
            call.resolve(JSObject().put("reader", convertReaderInterface(reader)))
        }
    }

    fun disconnectReader(call: PluginCall) {
        if (Terminal.getInstance().connectedReader == null) {
            call.resolve()
            return
        }

        Terminal.getInstance()
            .disconnectReader(
                object : Callback {
                    override fun onSuccess() {
                        notifyListeners(
                            TerminalEnumEvent.DisconnectedReader.webEventName,
                            emptyObject
                        )
                        call.resolve()
                    }

                    override fun onFailure(ex: TerminalException) {
                        call.reject(ex.localizedMessage, ex)
                    }
                }
            )
    }

    private fun connectTapToPayReader(call: PluginCall) {
        val reader = call.getObject("reader")
        val serialNumber = reader.getString("serialNumber")
        this.locationId = call.getString("locationId", this.locationId)

        val foundReader = this.findReader(this.discoveredReadersList, serialNumber)

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.")
            return
        }

        val autoReconnectOnUnexpectedDisconnect: Boolean = Objects.requireNonNullElse(
            call.getBoolean("autoReconnectOnUnexpectedDisconnect", false),
            false
        )

        val config: ConnectionConfiguration.TapToPayConnectionConfiguration = ConnectionConfiguration.TapToPayConnectionConfiguration(
            this.locationId!!,
            autoReconnectOnUnexpectedDisconnect,
            this.tapToPayReaderListener
        )
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call))
    }

    var tapToPayReaderListener: TapToPayReaderListener = object : TapToPayReaderListener {
        override fun onReaderReconnectFailed(reader: Reader) {
            notifyListeners(
                TerminalEnumEvent.ReaderReconnectFailed.webEventName,
                JSObject().put("reader", convertReaderInterface(reader))
            )
        }

        override fun onReaderReconnectStarted(
            reader: Reader,
            cancelReconnect: Cancelable,
            reason: DisconnectReason
        ) {
            cancelReaderConnectionCancellable = cancelReconnect
            notifyListeners(
                TerminalEnumEvent.ReaderReconnectStarted.webEventName,
                JSObject().put("reason", reason.toString())
                    .put("reader", convertReaderInterface(reader))
            )
        }

        override fun onReaderReconnectSucceeded(reader: Reader) {
            notifyListeners(
                TerminalEnumEvent.ReaderReconnectSucceeded.webEventName,
                JSObject().put("reader", convertReaderInterface(reader))
            )
        }

        override fun onDisconnect(reason: DisconnectReason) {
            notifyListeners(
                TerminalEnumEvent.DisconnectedReader.webEventName,
                JSObject().put("reason", reason.toString())
            )
        }
    }

    var internetReaderListener: InternetReaderListener = object : InternetReaderListener {
        override fun onDisconnect(reason: DisconnectReason) {
            notifyListeners(
                TerminalEnumEvent.DisconnectedReader.webEventName,
                JSObject().put("reason", reason.toString())
            )
        }
    }

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
    private fun connectInternetReader(call: PluginCall) {
        val reader = call.getObject("reader")
        val serialNumber = reader.getString("serialNumber")
        this.locationId = call.getString("locationId", this.locationId)

        val foundReader = this.findReader(this.discoveredReadersList, serialNumber)

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.")
            return
        }

        val config: ConnectionConfiguration.InternetConnectionConfiguration =
            ConnectionConfiguration.InternetConnectionConfiguration(
                true,
                this.internetReaderListener
            )
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call))
    }

    private fun connectUsbReader(call: PluginCall) {
        val reader = call.getObject("reader")
        val serialNumber = reader.getString("serialNumber")
        this.locationId = call.getString("locationId", this.locationId)

        val foundReader = this.findReader(this.discoveredReadersList, serialNumber)

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.")
            return
        }

        val config: ConnectionConfiguration.UsbConnectionConfiguration =
            ConnectionConfiguration.UsbConnectionConfiguration(
                this.locationId!!,
                true,
                this.readerListener()
            )
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call))
    }

    private fun connectBluetoothReader(call: PluginCall) {
        val reader = call.getObject("reader")
        val serialNumber = reader.getString("serialNumber")
        this.locationId = call.getString("locationId", this.locationId)

        val foundReader = this.findReader(this.discoveredReadersList, serialNumber)

        if (serialNumber == null || foundReader == null) {
            call.reject("The reader value is not set correctly.")
            return
        }
        val autoReconnectOnUnexpectedDisconnect: Boolean = Objects.requireNonNullElse(
            call.getBoolean("autoReconnectOnUnexpectedDisconnect", false),
            false
        )

        val config: ConnectionConfiguration.BluetoothConnectionConfiguration =
            ConnectionConfiguration.BluetoothConnectionConfiguration(
                this.locationId!!,
                autoReconnectOnUnexpectedDisconnect,
                this.readerListener()
            )
        Terminal.getInstance().connectReader(foundReader, config, this.readerCallback(call))
    }

    fun cancelDiscoverReaders(call: PluginCall) {
        if (discoveryCancelable == null || discoveryCancelable!!.isCompleted) {
            call.resolve()
            return
        }
        discoveryCancelable!!.cancel(
            object : Callback {
                override fun onSuccess() {
                    notifyListeners(
                        TerminalEnumEvent.CancelDiscoveredReaders.webEventName,
                        emptyObject
                    )
                    call.resolve()
                }

                override fun onFailure(ex: TerminalException) {
                    call.reject(ex.localizedMessage, ex)
                }
            }
        )
    }

    fun collectPaymentMethod(call: PluginCall) {
        val paymentIntent = call.getString("paymentIntent")
        if (paymentIntent == null) {
            call.reject("The value of paymentIntent is not set correctly.")
            return
        }
        this.collectCall = call
        Terminal.getInstance().retrievePaymentIntent(paymentIntent, createPaymentIntentCallback)
    }

    fun cancelCollectPaymentMethod(call: PluginCall) {
        if (this.collectCancelable == null || collectCancelable!!.isCompleted) {
            call.resolve()
            return
        }

        collectCancelable!!.cancel(
            object : Callback {
                override fun onSuccess() {
                    notifyListeners(TerminalEnumEvent.Canceled.webEventName, emptyObject)
                    call.resolve()
                }

                override fun onFailure(e: TerminalException) {
                    call.reject(e.localizedMessage)
                }
            }
        )
    }

    private val createPaymentIntentCallback: PaymentIntentCallback =
        object : PaymentIntentCallback {
            override fun onSuccess(paymentIntent: PaymentIntent) {
                val collectConfig: CollectConfiguration =
                    CollectConfiguration.Builder().updatePaymentIntent(true).build()
                collectCancelable = Terminal.getInstance().collectPaymentMethod(
                    paymentIntent,
                    collectPaymentMethodCallback,
                    collectConfig
                )
            }

            override fun onFailure(exception: TerminalException) {
                notifyListeners(TerminalEnumEvent.Failed.webEventName, emptyObject)
                val returnObject = JSObject()
                returnObject.put("message", exception.localizedMessage)
                if (exception.apiError != null) {
                    returnObject.put("code", exception.apiError!!.code)
                    returnObject.put("declineCode", exception.apiError!!.declineCode)
                }
                collectCall!!.reject(exception.localizedMessage, null as String?, returnObject)
            }
        }

    private val collectPaymentMethodCallback: PaymentIntentCallback =
        object : PaymentIntentCallback {
            override fun onSuccess(paymentIntent: PaymentIntent) {
                paymentIntentInstance = paymentIntent
                notifyListeners(TerminalEnumEvent.CollectedPaymentIntent.webEventName, emptyObject)

                val pm = paymentIntent.paymentMethod
                var card: CardPresentDetails? = null

                if (pm != null) {
                    card =
                        if (pm.cardPresentDetails != null) pm.cardPresentDetails else pm.interacPresentDetails
                }

                if (card != null) {
                    collectCall!!.resolve(
                        JSObject()
                            .put("brand", card.brand)
                            .put("cardholderName", card.cardholderName)
                            .put("country", card.country)
                            .put("emvAuthData", card.emvAuthData)
                            .put("expMonth", card.expMonth)
                            .put("expYear", card.expYear)
                            .put("funding", card.funding)
                            .put("generatedCard", card.generatedCard)
                            .put(
                                "incrementalAuthorizationStatus",
                                card.incrementalAuthorizationStatus
                            )
                            .put("last4", card.last4)
                            .put("networks", card.networks)
                            .put("readMethod", card.readMethod)
                    )
                } else {
                    collectCall!!.resolve()
                }
            }

            override fun onFailure(exception: TerminalException) {
                notifyListeners(TerminalEnumEvent.Failed.webEventName, emptyObject)
                var errorCode: String? = "generic_error"
                if (exception.apiError != null && exception.apiError!!.code != null) {
                    errorCode = exception.apiError!!.code
                }
                val returnObject = JSObject()
                returnObject.put("message", exception.localizedMessage)
                if (exception.apiError != null) {
                    returnObject.put("code", exception.apiError!!.code)
                    returnObject.put("declineCode", exception.apiError!!.declineCode)
                }
                collectCall!!.reject(exception.localizedMessage, errorCode, returnObject)
            }
        }

    fun confirmPaymentIntent(call: PluginCall) {
        if (this.paymentIntentInstance == null) {
            call.reject("PaymentIntent not found for confirmPaymentIntent. Use collect method first and try again.")
            return
        }

        this.confirmPaymentIntentCall = call
        Terminal.getInstance()
            .confirmPaymentIntent(this.paymentIntentInstance!!, confirmPaymentMethodCallback)
    }

    fun installAvailableUpdate(call: PluginCall) {
        Terminal.getInstance().installAvailableUpdate()
        call.resolve(emptyObject)
    }

    fun cancelInstallUpdate(call: PluginCall) {
        if (this.installUpdateCancelable == null || installUpdateCancelable!!.isCompleted) {
            call.resolve()
            return
        }

        installUpdateCancelable!!.cancel(
            object : Callback {
                override fun onSuccess() {
                    call.resolve()
                }

                override fun onFailure(e: TerminalException) {
                    call.reject(e.localizedMessage)
                }
            }
        )
    }

    fun setReaderDisplay(call: PluginCall) {
        val currency = call.getString("currency", null)
        if (currency == null) {
            call.reject("You must provide a currency value")
            return
        }

        val tax = Objects.requireNonNullElse(call.getInt("tax", 0), 0)
        val total = Objects.requireNonNullElse(call.getInt("total", 0), 0)
        if (total == 0) {
            call.reject("You must provide a total value")
            return
        }

        val lineItems = call.getArray("lineItems")
        val lineItemsList: List<JSONObject>
        try {
            lineItemsList = lineItems.toList()
        } catch (e: JSONException) {
            call.reject(e.localizedMessage)
            return
        }

        val cartLineItems: MutableList<CartLineItem> = ArrayList()
        for (item in lineItemsList) {
            try {
                val itemObj = JSObject.fromJSONObject(item)
                cartLineItems.add(
                    CartLineItem.Builder(
                        Objects.requireNonNull(itemObj.getString("displayName")!!),
                        Objects.requireNonNull(itemObj.getInteger("quantity")!!),
                        Objects.requireNonNull(itemObj.getInteger("amount")!!).toLong()
                    ).build()
                )
            } catch (e: JSONException) {
                call.reject(e.localizedMessage)
                return
            }
        }

        val cart: Cart = Cart.Builder(currency, tax!!.toLong(), total!!.toLong(), cartLineItems).build()

        Terminal.getInstance()
            .setReaderDisplay(
                cart,
                object : Callback {
                    override fun onSuccess() {
                        call.resolve()
                    }

                    override fun onFailure(e: TerminalException) {
                        call.reject(e.errorMessage)
                    }
                }
            )
    }

    fun clearReaderDisplay(call: PluginCall) {
        Terminal.getInstance()
            .clearReaderDisplay(
                object : Callback {
                    override fun onSuccess() {
                        call.resolve()
                    }

                    override fun onFailure(e: TerminalException) {
                        call.reject(e.errorMessage)
                    }
                }
            )
    }

    fun rebootReader(call: PluginCall) {
        Terminal.getInstance()
            .rebootReader(
                object : Callback {
                    override fun onSuccess() {
                        paymentIntentInstance = null
                        call.resolve(emptyObject)
                    }

                    override fun onFailure(e: TerminalException) {
                        call.reject(e.localizedMessage)
                    }
                }
            )
    }

    fun cancelReaderReconnection(call: PluginCall) {
        if (cancelReaderConnectionCancellable == null || cancelReaderConnectionCancellable!!.isCompleted) {
            call.resolve()
            return
        }
        cancelReaderConnectionCancellable!!.cancel(
            object : Callback {
                override fun onSuccess() {
                    call.resolve()
                }

                override fun onFailure(ex: TerminalException) {
                    call.reject(ex.localizedMessage, ex)
                }
            }
        )
    }

    private val confirmPaymentMethodCallback: PaymentIntentCallback =
        object : PaymentIntentCallback {
            override fun onSuccess(paymentIntent: PaymentIntent) {
                notifyListeners(TerminalEnumEvent.ConfirmedPaymentIntent.webEventName, emptyObject)
                paymentIntentInstance = null
                confirmPaymentIntentCall!!.resolve()
            }

            override fun onFailure(exception: TerminalException) {
                notifyListeners(TerminalEnumEvent.Failed.webEventName, emptyObject)
                val returnObject = JSObject()
                returnObject.put("message", exception.localizedMessage)
                if (exception.apiError != null) {
                    returnObject.put("code", exception.apiError!!.code)
                    returnObject.put("declineCode", exception.apiError!!.declineCode)
                }
                confirmPaymentIntentCall!!.reject(
                    exception.localizedMessage,
                    null as String?,
                    returnObject
                )
            }
        }

    init {
        this.contextSupplier = contextSupplier
        this.discoveredReadersList = ArrayList()
    }

    private fun readerCallback(call: PluginCall): ReaderCallback {
        return object : ReaderCallback {
            override fun onSuccess(r: Reader) {
                notifyListeners(TerminalEnumEvent.ConnectedReader.webEventName, emptyObject)
                call.resolve()
            }

            override fun onFailure(ex: TerminalException) {
                ex.printStackTrace()
                call.reject(ex.localizedMessage, ex)
            }
        }
    }

    private fun readerListener(): MobileReaderListener {
        return object : MobileReaderListener {
            override fun onStartInstallingUpdate(
                update: ReaderSoftwareUpdate,
                cancelable: Cancelable?
            ) {
                // Show UI communicating that a required update has started installing
                installUpdateCancelable = cancelable
                notifyListeners(
                    TerminalEnumEvent.StartInstallingUpdate.webEventName,
                    JSObject().put("update", convertReaderSoftwareUpdate(update))
                )
            }

            override fun onReportReaderSoftwareUpdateProgress(progress: Float) {
                // Update the progress of the install
                notifyListeners(
                    TerminalEnumEvent.ReaderSoftwareUpdateProgress.webEventName,
                    JSObject().put("progress", progress.toDouble())
                )
            }

            override fun onFinishInstallingUpdate(
                update: ReaderSoftwareUpdate?,
                error: TerminalException?
            ) {
                val eventObject = JSObject()

                if (error != null) {
                    // note: Since errorCode cannot be obtained in iOS, use errorMessage for unification.
                    eventObject.put("error", error.localizedMessage)
                    notifyListeners(
                        TerminalEnumEvent.FinishInstallingUpdate.webEventName,
                        eventObject
                    )
                    return
                }

                eventObject.put(
                    "update",
                    if (update == null) null else convertReaderSoftwareUpdate(update)
                )
                notifyListeners(TerminalEnumEvent.FinishInstallingUpdate.webEventName, eventObject)
            }

            override fun onBatteryLevelUpdate(
                batteryLevel: Float,
                batteryStatus: BatteryStatus,
                isCharging: Boolean
            ) {
                notifyListeners(
                    TerminalEnumEvent.BatteryLevel.webEventName,
                    JSObject().put("level", batteryLevel.toDouble()).put("charging", isCharging)
                        .put("status", batteryStatus.toString())
                )
            }

            override fun onReportLowBatteryWarning() {}

            override fun onReportAvailableUpdate(update: ReaderSoftwareUpdate) {
                // An update is available for the connected reader. Show this update in your application.
                // This update can be installed using `Terminal.getInstance().installAvailableUpdate`.
                notifyListeners(
                    TerminalEnumEvent.ReportAvailableUpdate.webEventName,
                    JSObject().put("update", convertReaderSoftwareUpdate(update))
                )
            }

            override fun onReportReaderEvent(event: ReaderEvent) {
                notifyListeners(
                    TerminalEnumEvent.ReaderEvent.webEventName,
                    JSObject().put("event", event.toString())
                )
            }

            override fun onRequestReaderDisplayMessage(message: ReaderDisplayMessage) {
                notifyListeners(
                    TerminalEnumEvent.RequestDisplayMessage.webEventName,
                    JSObject().put("messageType", message.name).put("message", message.toString())
                )
            }

            override fun onRequestReaderInput(options: ReaderInputOptions) {
                val optionsList: List<ReaderInputOptions.ReaderInputOption> = options.options
                val jsOptions = JSArray()
                for (optionType in optionsList) {
                    jsOptions.put(optionType.name)
                }

                notifyListeners(
                    TerminalEnumEvent.RequestReaderInput.webEventName,
                    JSObject().put("options", jsOptions).put("message", options.toString())
                )
            }

            override fun onDisconnect(reason: DisconnectReason) {
                notifyListeners(
                    TerminalEnumEvent.DisconnectedReader.webEventName,
                    JSObject().put("reason", reason.toString())
                )
            }
        }
    }

    private fun convertReaderInterface(reader: Reader?): JSObject {
        return JSObject()
            .put("label", reader!!.label)
            .put("serialNumber", reader.serialNumber)
            .put("id", reader.id)
            .put("locationId", if (reader.location != null) reader.location!!.id else null)
            .put("deviceSoftwareVersion", reader.softwareVersion)
            .put("simulated", reader.isSimulated)
            .put("serialNumber", reader.serialNumber)
            .put("ipAddress", reader.ipAddress)
            .put("baseUrl", reader.baseUrl)
            .put("bootloaderVersion", reader.bootloaderVersion)
            .put("configVersion", reader.configVersion)
            .put("emvKeyProfileId", reader.emvKeyProfileId)
            .put("firmwareVersion", reader.firmwareVersion)
            .put("hardwareVersion", reader.hardwareVersion)
            .put("macKeyProfileId", reader.macKeyProfileId)
            .put("pinKeyProfileId", reader.pinKeyProfileId)
            .put("trackKeyProfileId", reader.trackKeyProfileId)
            .put("settingsVersion", reader.settingsVersion)
            .put("pinKeysetId", reader.pinKeysetId)
            .put("deviceType", terminalMappers.mapFromDeviceType(reader.deviceType))
            .put("status", terminalMappers.mapFromNetworkStatus(reader.networkStatus))
            .put("locationStatus", terminalMappers.mapFromLocationStatus(reader.locationStatus))
            .put(
                "batteryLevel",
                if (reader.batteryLevel != null) reader.batteryLevel!!.toDouble() else null
            )
            .put(
                "availableUpdate",
                terminalMappers.mapFromReaderSoftwareUpdate(reader.availableUpdate)
            )
            .put("location", terminalMappers.mapFromLocation(reader.location))
    }

    private fun convertReaderSoftwareUpdate(update: ReaderSoftwareUpdate): JSObject? {
        return terminalMappers.mapFromReaderSoftwareUpdate(update)
    }

    private fun findReader(discoveredReadersList: List<Reader?>, serialNumber: String?): Reader? {
        var foundReader: Reader? = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            foundReader = discoveredReadersList
                .stream()
                .filter { device: Reader? -> serialNumber != null && serialNumber == device!!.serialNumber }
                .findFirst()
                .orElse(null)
        } else {
            for (device in discoveredReadersList) {
                if (serialNumber != null && serialNumber == device!!.serialNumber) {
                    foundReader = device
                    break
                }
            }
        }

        return foundReader
    }
}
