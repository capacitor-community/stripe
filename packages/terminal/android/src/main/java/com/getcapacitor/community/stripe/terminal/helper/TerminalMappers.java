package com.getcapacitor.community.stripe.terminal.helper;

import com.getcapacitor.JSObject;
import com.stripe.stripeterminal.external.models.DeviceType;
import com.stripe.stripeterminal.external.models.Location;
import com.stripe.stripeterminal.external.models.LocationStatus;
import com.stripe.stripeterminal.external.models.Reader;
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate;

public class TerminalMappers {

    public JSObject mapFromLocation(Location location) {
        if (location == null) {
            return new JSObject();
        }

        JSObject address = new JSObject();

        if (location.getAddress() != null) {
            address
                    .put("country", location.getAddress().getCountry())
                    .put("city", location.getAddress().getCity())
                    .put("postalCode", location.getAddress().getPostalCode())
                    .put("line1", location.getAddress().getLine1())
                    .put("line2", location.getAddress().getLine2())
                    .put("state", location.getAddress().getState());
        }

        return new JSObject()
                .put("id", location.getId())
                .put("displayName", location.getDisplayName())
                .put("address", address)
                .put("livemode", location.getLivemode());
    }

    public JSObject mapFromReaderSoftwareUpdate(ReaderSoftwareUpdate update) {
        if (update == null) {
            return new JSObject();
        }

        return new JSObject()
                .put("deviceSoftwareVersion", update.getVersion())
                .put("estimatedUpdateTime", update.getTimeEstimate().toString())
                .put("requiredAt", update.getRequiredAt().getTime());
    }

    public String mapFromLocationStatus(LocationStatus status) {
        if (status == null) {
            return "unknown";
        }

        return switch (status) {
            case NOT_SET -> "notSet";
            case SET -> "set";
            case UNKNOWN -> "unknown";
            default -> "unknown";
        };
    }

    public String mapFromNetworkStatus(Reader.NetworkStatus status) {
        if (status == null) {
            return "unknown";
        }

        return switch (status) {
            case OFFLINE -> "offline";
            case ONLINE -> "online";
            default -> "unknown";
        };
    }

    public String mapFromDeviceType(DeviceType type) {
        switch (type) {
            case CHIPPER_1X:
                return "chipper1X";
            case CHIPPER_2X:
                return "chipper2X";
            case COTS_DEVICE:
                return "cotsDevice";
            case ETNA:
                return "etna";
            case STRIPE_M2:
                return "stripeM2";
            case STRIPE_S700:
                return "stripeS700";
            case STRIPE_S700_DEVKIT:
                return "stripeS700Devkit";
            // React Native has this model. deprecated?
            //            case STRIPE_S710:
            //                return "stripeS710";
            //            case STRIPE_S710_DEVKIT:
            //                return "stripeS710Devkit";
            case UNKNOWN:
                return "unknown";
            case VERIFONE_P400:
                return "verifoneP400";
            case WISECUBE:
                return "wiseCube";
            case WISEPAD_3:
                return "wisePad3";
            case WISEPAD_3S:
                return "wisePad3s";
            case WISEPOS_E:
                return "wisePosE";
            case WISEPOS_E_DEVKIT:
                return "wisePosEDevkit";
            default:
                throw new IllegalArgumentException("Unknown DeviceType: " + type);
        }
    }
}
