package com.getcapacitor.community.stripe.terminal-app-on-devices

import android.Manifest
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresApi
import com.getcapacitor.JSObject
import com.getcapacitor.PermissionState
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import com.getcapacitor.annotation.PermissionCallback
import com.stripe.stripeterminal.external.models.TerminalException

@RequiresApi(api = Build.VERSION_CODES.S)
@CapacitorPlugin(
    name = "StripeTerminalAppOnDevices",
    permissions = [Permission(
        alias = "location",
        strings = [Manifest.permission.ACCESS_FINE_LOCATION]
    ), Permission(
        alias = "bluetooth_old",
        strings = [Manifest.permission.BLUETOOTH, Manifest.permission.BLUETOOTH_ADMIN]
    ), Permission(
        alias = "bluetooth",
        strings = [Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_ADVERTISE]
    )]
)
class StripeTerminalAppOnDevicesPlugin : Plugin() {
    private val implementation = StripeTerminal(
        { this.context },
        { this.activity },
        { eventName: String?, data: JSObject? -> this.notifyListeners(eventName, data) },
        logTag
    )

    @PluginMethod
    @Throws(TerminalException::class)
    fun initialize(call: PluginCall) {
        this._initialize(call)
    }

    @PluginMethod
    fun setConnectionToken(call: PluginCall) {
        implementation.setConnectionToken(call)
    }

    @PluginMethod
    fun setSimulatorConfiguration(call: PluginCall) {
        implementation.setSimulatorConfiguration(call)
    }

    @PermissionCallback
    @Throws(TerminalException::class)
    private fun locationPermsCallback(call: PluginCall) {
        if (getPermissionState("location") == PermissionState.GRANTED) {
            this._initialize(call)
        } else {
            requestPermissionForAlias("location", call, "locationPermsCallback")
        }
    }

    @PermissionCallback
    @Throws(TerminalException::class)
    private fun bluetoothOldPermsCallback(call: PluginCall) {
        if (getPermissionState("bluetooth_old") == PermissionState.GRANTED) {
            if (call.methodName == "discoverReaders") {
                this.discoverReaders(call)
            } else {
                this.connectReader(call)
            }
        } else {
            requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback")
        }
    }

    @PermissionCallback
    @Throws(TerminalException::class)
    private fun bluetoothPermsCallback(call: PluginCall) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            if (call.methodName == "discoverReaders") {
                this.discoverReaders(call)
            } else {
                this.connectReader(call)
            }
        } else {
            requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback")
        }
    }

    @Throws(TerminalException::class)
    private fun _initialize(call: PluginCall) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermsCallback")
        } else {
            Log.d("Capacitor:permission location", getPermissionState("location").toString())
            implementation.initialize(call)
        }
    }

    @PluginMethod(returnType = PluginMethod.RETURN_CALLBACK)
    fun discoverReaders(call: PluginCall) {
        if (call.getString("type") == TerminalConnectTypes.Bluetooth.webEventName || call.getString(
                "type"
            ) == TerminalConnectTypes.Simulated.webEventName
        ) {
            Log.d(
                "Capacitor:permission bluetooth_old",
                getPermissionState("bluetooth_old").toString()
            )
            Log.d("Capacitor:permission bluetooth", getPermissionState("bluetooth").toString())
            if (Build.VERSION.SDK_INT <= 30 && getPermissionState("bluetooth_old") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback")
            } else if (Build.VERSION.SDK_INT > 30 && getPermissionState("bluetooth") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback")
            } else {
                implementation.onDiscoverReaders(call)
            }
        } else {
            implementation.onDiscoverReaders(call)
        }
    }

    @PluginMethod
    fun cancelDiscoverReaders(call: PluginCall) {
        implementation.cancelDiscoverReaders(call)
    }

    @PluginMethod
    fun connectReader(call: PluginCall) {
        if (call.getString("type") == TerminalConnectTypes.Bluetooth.webEventName) {
            Log.d(
                "Capacitor:permission bluetooth_old",
                getPermissionState("bluetooth_old").toString()
            )
            Log.d("Capacitor:permission bluetooth", getPermissionState("bluetooth").toString())
            if (Build.VERSION.SDK_INT <= 30 && getPermissionState("bluetooth_old") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback")
            } else if (Build.VERSION.SDK_INT > 30 && getPermissionState("bluetooth") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback")
            } else {
                implementation.connectReader(call)
            }
        } else {
            implementation.connectReader(call)
        }
    }

    @PluginMethod
    fun getConnectedReader(call: PluginCall) {
        implementation.getConnectedReader(call)
    }

    @PluginMethod
    fun disconnectReader(call: PluginCall) {
        implementation.disconnectReader(call)
    }

    @PluginMethod
    fun collectPaymentMethod(call: PluginCall) {
        implementation.collectPaymentMethod(call)
    }

    @PluginMethod
    fun cancelCollectPaymentMethod(call: PluginCall) {
        implementation.cancelCollectPaymentMethod(call)
    }

    @PluginMethod
    fun confirmPaymentIntent(call: PluginCall) {
        implementation.confirmPaymentIntent(call)
    }

    @PluginMethod
    fun installAvailableUpdate(call: PluginCall) {
        implementation.installAvailableUpdate(call)
    }

    @PluginMethod
    fun cancelInstallUpdate(call: PluginCall) {
        implementation.cancelInstallUpdate(call)
    }

    @PluginMethod
    fun setReaderDisplay(call: PluginCall) {
        implementation.setReaderDisplay(call)
    }

    @PluginMethod
    fun clearReaderDisplay(call: PluginCall) {
        implementation.clearReaderDisplay(call)
    }

    @PluginMethod
    fun rebootReader(call: PluginCall) {
        implementation.rebootReader(call)
    }

    @PluginMethod
    fun cancelReaderReconnection(call: PluginCall) {
        implementation.cancelReaderReconnection(call)
    }
}
