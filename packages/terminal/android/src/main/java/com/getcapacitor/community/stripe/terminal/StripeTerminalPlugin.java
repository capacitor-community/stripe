package com.getcapacitor.community.stripe.terminal;

import android.Manifest;
import android.os.Build;
import android.util.Log;
import androidx.annotation.RequiresApi;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.stripe.stripeterminal.external.models.TerminalException;
import java.util.Objects;

@RequiresApi(api = Build.VERSION_CODES.S)
@CapacitorPlugin(
    name = "StripeTerminal",
    permissions = {
        @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(alias = "bluetooth_old", strings = { Manifest.permission.BLUETOOTH, Manifest.permission.BLUETOOTH_ADMIN }),
        @Permission(
            alias = "bluetooth",
            strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_ADVERTISE }
        )
    }
)
public class StripeTerminalPlugin extends Plugin {

    private final StripeTerminal implementation = new StripeTerminal(
        this::getContext,
        this::getActivity,
        this::notifyListeners,
        getLogTag()
    );

    @PluginMethod
    public void initialize(PluginCall call) throws TerminalException {
        this._initialize(call);
    }

    @PluginMethod
    public void setConnectionToken(PluginCall call) {
        this.implementation.setConnectionToken(call);
    }

    @PluginMethod
    public void setSimulatorConfiguration(PluginCall call) {
        this.implementation.setSimulatorConfiguration(call);
    }

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) throws TerminalException {
        if (getPermissionState("location") == PermissionState.GRANTED) {
            this._initialize(call);
        } else {
            requestPermissionForAlias("location", call, "locationPermsCallback");
        }
    }

    @PermissionCallback
    private void bluetoothOldPermsCallback(PluginCall call) throws TerminalException {
        if (getPermissionState("bluetooth_old") == PermissionState.GRANTED) {
            if (Objects.equals(call.getMethodName(), "discoverReaders")) {
                this.discoverReaders(call);
            } else {
                this.connectReader(call);
            }
        } else {
            requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback");
        }
    }

    @PermissionCallback
    private void bluetoothPermsCallback(PluginCall call) throws TerminalException {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            if (Objects.equals(call.getMethodName(), "discoverReaders")) {
                this.discoverReaders(call);
            } else {
                this.connectReader(call);
            }
        } else {
            requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback");
        }
    }

    private void _initialize(PluginCall call) throws TerminalException {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermsCallback");
        } else {
            Log.d("Capacitor:permission location", getPermissionState("location").toString());
            this.implementation.initialize(call);
        }
    }

    @PluginMethod(returnType =  PluginMethod.RETURN_CALLBACK)
    public void discoverReaders(PluginCall call) {
        if (
            Objects.equals(call.getString("type"), TerminalConnectTypes.Bluetooth.getWebEventName()) ||
            Objects.equals(call.getString("type"), TerminalConnectTypes.Simulated.getWebEventName())
        ) {
            Log.d("Capacitor:permission bluetooth_old", getPermissionState("bluetooth_old").toString());
            Log.d("Capacitor:permission bluetooth", getPermissionState("bluetooth").toString());
            if (Build.VERSION.SDK_INT <= 30 && getPermissionState("bluetooth_old") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback");
            } else if (Build.VERSION.SDK_INT > 30 && getPermissionState("bluetooth") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback");
            } else {
                this.implementation.onDiscoverReaders(call);
            }
        } else {
            this.implementation.onDiscoverReaders(call);
        }
    }

    @PluginMethod
    public void cancelDiscoverReaders(PluginCall call) {
        this.implementation.cancelDiscoverReaders(call);
    }

    @PluginMethod
    public void connectReader(PluginCall call) {
        if (Objects.equals(call.getString("type"), TerminalConnectTypes.Bluetooth.getWebEventName())) {
            Log.d("Capacitor:permission bluetooth_old", getPermissionState("bluetooth_old").toString());
            Log.d("Capacitor:permission bluetooth", getPermissionState("bluetooth").toString());
            if (Build.VERSION.SDK_INT <= 30 && getPermissionState("bluetooth_old") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth_old", call, "bluetoothOldPermsCallback");
            } else if (Build.VERSION.SDK_INT > 30 && getPermissionState("bluetooth") != PermissionState.GRANTED) {
                requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback");
            } else {
                this.implementation.connectReader(call);
            }
        } else {
            this.implementation.connectReader(call);
        }
    }

    @PluginMethod
    public void getConnectedReader(final PluginCall call) {
        this.implementation.getConnectedReader(call);
    }

    @PluginMethod
    public void disconnectReader(final PluginCall call) {
        this.implementation.disconnectReader(call);
    }

    @PluginMethod
    public void collectPaymentMethod(PluginCall call) {
        this.implementation.collectPaymentMethod(call);
    }

    @PluginMethod
    public void cancelCollectPaymentMethod(final PluginCall call) {
        this.implementation.cancelCollectPaymentMethod(call);
    }

    @PluginMethod
    public void confirmPaymentIntent(PluginCall call) {
        this.implementation.confirmPaymentIntent(call);
    }

    @PluginMethod
    public void installAvailableUpdate(PluginCall call) {
        this.implementation.installAvailableUpdate(call);
    }

    @PluginMethod
    public void cancelInstallUpdate(PluginCall call) {
        this.implementation.cancelInstallUpdate(call);
    }

    @PluginMethod
    public void setReaderDisplay(PluginCall call) {
        this.implementation.setReaderDisplay(call);
    }

    @PluginMethod
    public void clearReaderDisplay(PluginCall call) {
        this.implementation.clearReaderDisplay(call);
    }

    @PluginMethod
    public void rebootReader(PluginCall call) {
        this.implementation.rebootReader(call);
    }

    @PluginMethod
    public void cancelReaderReconnection(PluginCall call) {
        this.implementation.cancelReaderReconnection(call);
    }
}
