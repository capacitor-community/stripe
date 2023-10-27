package com.getcapacitor.community.stripe.terminal;

import android.Manifest;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.stripe.stripeterminal.external.models.TerminalException;

@RequiresApi(api = Build.VERSION_CODES.S)
@CapacitorPlugin(
    name = "StripeTerminal",
    permissions = {
        @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(alias = "bluetooth", strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT })
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

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) throws TerminalException {
        if (getPermissionState("location") == PermissionState.GRANTED) {
            this._initialize(call);
        } else {
            call.reject("Permission is required to get location");
        }
    }

    @PermissionCallback
    private void bluetoothPermsCallback(PluginCall call) throws TerminalException {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            this._initialize(call);
        } else {
            call.reject("Permission is required to get bluetooth");
        }
    }

    private void _initialize(PluginCall call) throws TerminalException {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermsCallback");
        } else if (getPermissionState("bluetooth") != PermissionState.GRANTED) {
            requestPermissionForAlias("bluetooth", call, "bluetoothPermsCallback");
        } else {
            this.implementation.initialize(call);
        }
    }

    @PluginMethod
    public void discoverReaders(PluginCall call) {
        this.implementation.onDiscoverReaders(call);
    }

    @PluginMethod
    public void cancelDiscoverReaders(PluginCall call) {
        this.implementation.cancelDiscoverReaders(call);
    }

    @PluginMethod
    public void connectReader(PluginCall call) {
        this.implementation.connectReader(call);
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
    public void collectPayment(PluginCall call) {
        this.implementation.collectPayment(call);
    }

    @PluginMethod
    public void collectPaymentMethod(PluginCall call) {
        this.implementation.collectPaymentMethod(call);
    }

    @PluginMethod
    public void cancelCollect(final PluginCall call) {
        this.implementation.cancelCollect(call);
    }
}
