package com.getcapacitor.community.stripe.terminal-app-on-devices.helper

import com.getcapacitor.JSObject
import com.stripe.stripeterminal.external.models.DeviceType
import com.stripe.stripeterminal.external.models.Location
import com.stripe.stripeterminal.external.models.LocationStatus
import com.stripe.stripeterminal.external.models.Reader
import com.stripe.stripeterminal.external.models.ReaderSoftwareUpdate

class TerminalMappers {
    fun mapFromLocation(location: Location?): JSObject {
        if (location == null) {
            return JSObject()
        }

        val address = JSObject()

        if (location.address != null) {
            address
                .put("country", location.address!!.country)
                .put("city", location.address!!.city)
                .put("postalCode", location.address!!.postalCode)
                .put("line1", location.address!!.line1)
                .put("line2", location.address!!.line2)
                .put("state", location.address!!.state)
        }

        return JSObject()
            .put("id", location.id)
            .put("displayName", location.displayName)
            .put("address", address)
            .put("livemode", location.livemode)
    }

    fun mapFromReaderSoftwareUpdate(update: ReaderSoftwareUpdate?): JSObject {
        if (update == null) {
            return JSObject()
        }

        return JSObject()
            .put("deviceSoftwareVersion", update.version)
            .put("estimatedUpdateTime", update.durationEstimate.toString())
            .put("requiredAt", update.requiredAtMs)
    }

    fun mapFromLocationStatus(status: LocationStatus?): String {
        if (status == null) {
            return "UNKNOWN"
        }

        return when (status) {
            LocationStatus.NOT_SET -> "NOT_SET"
            LocationStatus.SET -> "SET"
            LocationStatus.UNKNOWN -> "UNKNOWN"
            else -> "UNKNOWN"
        }
    }

    fun mapFromNetworkStatus(status: Reader.NetworkStatus?): String {
        if (status == null) {
            return "UNKNOWN"
        }

        return when (status) {
            Reader.NetworkStatus.OFFLINE -> "OFFLINE"
            Reader.NetworkStatus.ONLINE -> "ONLINE"
            else -> "UNKNOWN"
        }
    }

    fun mapFromDeviceType(type: DeviceType): String {
        return when (type) {
            DeviceType.CHIPPER_1X -> "chipper1X"
            DeviceType.CHIPPER_2X -> "chipper2X"
            DeviceType.TAP_TO_PAY_DEVICE -> "tapToPayDevice"
            DeviceType.ETNA -> "etna"
            DeviceType.STRIPE_M2 -> "stripeM2"
            DeviceType.STRIPE_S700 -> "stripeS700"
            DeviceType.STRIPE_S700_DEVKIT -> "stripeS700Devkit"
            DeviceType.UNKNOWN -> "unknown"
            DeviceType.VERIFONE_P400 -> "verifoneP400"
            DeviceType.WISECUBE -> "wiseCube"
            DeviceType.WISEPAD_3 -> "wisePad3"
            DeviceType.WISEPAD_3S -> "wisePad3s"
            DeviceType.WISEPOS_E -> "wisePosE"
            DeviceType.WISEPOS_E_DEVKIT -> "wisePosEDevkit"
            else -> throw IllegalArgumentException("Unknown DeviceType: $type")
        }
    }
}
