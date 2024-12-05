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
            .put("estimatedUpdateTime", update.getDurationEstimate().toString())
            .put("requiredAt", update.getRequiredAtMs());
    }

    public String mapFromLocationStatus(LocationStatus status) {
        if (status == null) {
            return "UNKNOWN";
        }

        return switch (status) {
            case NOT_SET -> "NOT_SET";
            case SET -> "SET";
            case UNKNOWN -> "UNKNOWN";
            default -> "UNKNOWN";
        };
    }

    public String mapFromNetworkStatus(Reader.NetworkStatus status) {
        if (status == null) {
            return "unknown";
        }

        return switch (status) {
            case OFFLINE -> "OFFLINE";
            case ONLINE -> "ONLINE";
            default -> "UNKNOWN";
        };
    }

    public String mapFromDeviceType(DeviceType type) {
        return switch (type) {
            case CHIPPER_1X -> "chipper1X";
            case CHIPPER_2X -> "chipper2X";
            case TAP_TO_PAY_DEVICE -> "tapToPayDevice";
            case ETNA -> "etna";
            case STRIPE_M2 -> "stripeM2";
            case STRIPE_S700 -> "stripeS700";
            case STRIPE_S700_DEVKIT -> "stripeS700Devkit";
            // React Native has this model. deprecated?
            //            case STRIPE_S710:
            //                return "stripeS710";
            //            case STRIPE_S710_DEVKIT:
            //                return "stripeS710Devkit";
            case UNKNOWN -> "unknown";
            case VERIFONE_P400 -> "verifoneP400";
            case WISECUBE -> "wiseCube";
            case WISEPAD_3 -> "wisePad3";
            case WISEPAD_3S -> "wisePad3s";
            case WISEPOS_E -> "wisePosE";
            case WISEPOS_E_DEVKIT -> "wisePosEDevkit";
            default -> throw new IllegalArgumentException("Unknown DeviceType: " + type);
        };
    }
}
