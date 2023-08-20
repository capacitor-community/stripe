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
import java.util.Objects;

@RequiresApi(api = Build.VERSION_CODES.S)
@CapacitorPlugin(
    name = "StripeTerminal",
    permissions = {
        @Permission(alias = "location", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(
            alias = "bluetooth",
            strings = {
                Manifest.permission.BLUETOOTH,
                Manifest.permission.BLUETOOTH_ADMIN,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_ADVERTISE,
                Manifest.permission.BLUETOOTH_CONNECT
            }
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
    public void connect(PluginCall call) {
        if (!Objects.equals(call.getString("type"), "tap-to-pay")) {
            call.unimplemented();
        }
        this.implementation.onDiscoverReaders(call);
    }
}
