import StripeTerminal
import Capacitor

class TerminalMappers {
    class func mapFromDeviceType(_ type: DeviceType) -> String {
        switch type {
        case DeviceType.tapToPay: return "tapToPay"
        case DeviceType.chipper1X: return "chipper1X"
        case DeviceType.chipper2X: return "chipper2X"
        case DeviceType.etna: return "etna"
        case DeviceType.stripeM2: return "stripeM2"
        case DeviceType.stripeS700: return "stripeS700"
        case DeviceType.stripeS700DevKit: return "stripeS700Devkit"
        case DeviceType.wiseCube: return "wiseCube"
        case DeviceType.wisePad3: return "wisePad3"
        case DeviceType.wisePosE: return "wisePosE"
        case DeviceType.wisePosEDevKit: return "wisePosEDevkit"
        default: return "unknown"
        }
    }

    class func mapFromAddress(_ address: Address?) -> JSObject {
        if let address = address {
            let result: JSObject = [
                "city": address.city ?? NSNull(),
                "country": address.country ?? NSNull(),
                "postalCode": address.postalCode ?? NSNull(),
                "line1": address.line1 ?? NSNull(),
                "line2": address.line2 ?? NSNull(),
                "state": address.state ?? NSNull()
            ]
            return result
        } else {
            return JSObject()
        }
    }

    class func mapFromLocation(_ location: Location?) -> JSObject {
        guard let unwrappedLocation = location else {
            return [:]
        }
        let result: JSObject = [
            "displayName": unwrappedLocation.displayName ?? NSNull(),
            "id": unwrappedLocation.stripeId,
            "livemode": unwrappedLocation.livemode,
            "address": mapFromAddress(unwrappedLocation.address)
        ]
        return result
    }

    class func mapFromLocationStatus(_ status: LocationStatus) -> String {
        switch status {
        case LocationStatus.notSet: return "NOT_SET"
        case LocationStatus.set: return "SET"
        case LocationStatus.unknown: return "UNKNOWN"
        default: return "UNKNOWN"
        }
    }

    class func mapFromLocationsList(_ locations: [Location]) -> JSArray {
        var list: JSArray = []

        for location in locations {
            let result = mapFromLocation(location)
            if result.count != 0 {
                list.append(result)
            }
        }

        return list
    }

    class func mapFromReaderNetworkStatus(_ status: ReaderNetworkStatus) -> String {
        switch status {
        case ReaderNetworkStatus.offline: return "OFFLINE"
        case ReaderNetworkStatus.online: return "ONLINE"
        default: return "UNKNOWN"
        }
    }

    class func convertDateToUnixTimestamp(date: Date?) -> String {
        if let date = date {
            let value = date.timeIntervalSince1970 * 1000.0
            return String(format: "%.0f", value)
        }
        return ""
    }

    class func mapFromReaderSoftwareUpdate(_ update: ReaderSoftwareUpdate?) -> JSObject {
        guard let unwrappedUpdate = update else {
            return JSObject()
        }
        let result: JSObject = [
            "deviceSoftwareVersion": unwrappedUpdate.deviceSoftwareVersion,
            "estimatedUpdateTime": mapFromUpdateTimeEstimate(unwrappedUpdate.durationEstimate),
            "requiredAt": convertDateToUnixTimestamp(date: unwrappedUpdate.requiredAt)
        ]
        return result
    }

    class func mapToCartLineItem(_ cartLineItem: NSDictionary) -> CartLineItem? {
        guard let displayName = cartLineItem["displayName"] as? String else { return nil }
        guard let quantity = cartLineItem["quantity"] as? NSNumber else { return nil }
        guard let amount = cartLineItem["amount"] as? NSNumber else { return nil }

        do {
            let lineItem = try CartLineItemBuilder(displayName: displayName)
                .setQuantity(Int(truncating: quantity))
                .setAmount(Int(truncating: amount))
                .build()
            return lineItem
        } catch {
            print("Error wihle building CartLineItem, error:\(error)")
            return nil
        }
    }

    class func mapToCartLineItems(_ cartLineItems: JSArray) -> [CartLineItem] {
        var items = [CartLineItem]()

        cartLineItems.forEach {
            if let item = $0 as? NSDictionary {
                if let lineItem = TerminalMappers.mapToCartLineItem(item) {
                    items.append(lineItem)
                }
            }
        }
        return items
    }

    class func mapToSimulateReaderUpdate(_ update: String) -> SimulateReaderUpdate {
        switch update {
        case "UPDATE_AVAILABLE": return SimulateReaderUpdate.available
        case "NONE": return SimulateReaderUpdate.none
        case "RANDOM": return SimulateReaderUpdate.random
        case "REQUIRED": return SimulateReaderUpdate.required
        case "LOW_BATTERY": return SimulateReaderUpdate.lowBattery
        case "LOW_BATTERY_SUCCEED_CONNECT": return SimulateReaderUpdate.lowBatterySucceedConnect
        default: return SimulateReaderUpdate.none
        }
    }

    class func mapToCardType(type: String) -> UInt {
        switch type {
        case "VISA": return 0
        case "VISA_DEBIT": return 1
        case "MASTERCARD": return 3
        case "MASTERCARD_DEBIT": return 2
        case "MASTERCARD_PREPAID": return 5
        case "AMEX": return 6
        case "AMEX_2": return 7
        case "DISCOVER": return 8
        case "DISCOVER_2": return 9
        case "DINERS": return 10
        case "DINERS_14_DIGITS": return 11
        case "JCB": return 12
        case "UNION_PAY": return 13
        case "INTERAC": return 14
        case "EFTPOS_AU_DEBIT": return 15
        case "VISA_US_COMMON_DEBIT": return 2
        case "CHARGE_DECLINED": return 18
        case "CHARGE_DECLINED_INSUFFICIENT_FUNDS": return 19
        case "CHARGE_DECLINED_LOST_CARD": return 20
        case "CHARGE_DECLINED_STOLEN_CARD": return 21
        case "CHARGE_DECLINED_EXPIRED_CARD": return 22
        case "CHARGE_DECLINED_PROCESSING_ERROR": return 23
        case "EFTPOS_AU_VISA_DEBIT": return 16
        case "EFTPOS_AU_DEBIT_MASTERCARD": return 17
        case "OFFLINE_PIN_CVM": return 27
        case "OFFLINE_PIN_SCA_RETRY": return 28
        case "ONLINE_PIN_CVM": return 25
        case "ONLINE_PIN_SCA_RETRY": return 26
        default:
            return 0
        }
    }

    class func mapFromReaderDisplayMessage(_ displayMessage: ReaderDisplayMessage) -> String {
        switch displayMessage {
        case ReaderDisplayMessage.insertCard: return "INSERT_CARD"
        case ReaderDisplayMessage.insertOrSwipeCard: return "INSERT_OR_SWIPE_CARD"
        case ReaderDisplayMessage.multipleContactlessCardsDetected: return "MULTIPLE_CONTACTLESS_CARDS_DETECTED"
        case ReaderDisplayMessage.removeCard: return "REMOVE_CARD"
        case ReaderDisplayMessage.retryCard: return "RETRY_CARD"
        case ReaderDisplayMessage.swipeCard: return "SWIPE_CARD"
        case ReaderDisplayMessage.tryAnotherCard: return "TRY_ANOTHER_CARD"
        case ReaderDisplayMessage.tryAnotherReadMethod: return "TRY_ANOTHER_READ_METHOD"
        case ReaderDisplayMessage.cardRemovedTooEarly: return "CARD_REMOVED_TOO_EARLY"
        default: return "unknown"
        }
    }

    class func mapFromReaderInputOptions(_ inputOptions: ReaderInputOptions) -> JSArray {
        let array = inputOptions.rawValue.bitComponents()
        var mappedOptions: JSArray = []

        array.forEach { item in
            switch item {
            case 0: return
            case 1: return mappedOptions.append("SWIPE")
            case 2: return mappedOptions.append("INSERT")
            case 4: return mappedOptions.append("TAP")
            default: return
            }
        }

        return mappedOptions
    }

    class func mapFromUpdateTimeEstimate(_ time: UpdateTimeEstimate) -> String {
        switch time {
        case UpdateTimeEstimate.estimate1To2Minutes: return "ONE_TO_TWO_MINUTES"
        case UpdateTimeEstimate.estimate2To5Minutes: return "TWO_TO_FIVE_MINUTES"
        case UpdateTimeEstimate.estimate5To15Minutes: return "FIVE_TO_FIFTEEN_MINUTES"
        case UpdateTimeEstimate.estimateLessThan1Minute: return "LESS_THAN_ONE_MINUTE"
        default: return "unknown"
        }
    }

    class func mapFromBatteryStatus(_ status: BatteryStatus) -> String {
        switch status {
        case BatteryStatus.critical: return "CRITICAL"
        case BatteryStatus.low: return "LOW"
        case BatteryStatus.nominal: return "NOMINAL"
        case BatteryStatus.unknown: return "UNKNOWN"
        default: return "UNKNOWN"
        }
    }

    class func mapFromReaderEvent(_ readerEvent: ReaderEvent) -> String {
        switch readerEvent {
        case .cardInserted: return "CARD_INSERTED"
        case .cardRemoved: return "CARD_REMOVED"
        @unknown default: return "UNKNOWN"
        }
    }

    class func mapFromPaymentStatus(_ paymentStatus: PaymentStatus) -> String {
        switch paymentStatus {
        case PaymentStatus.notReady: return "NOT_READY"
        case PaymentStatus.ready: return "READY"
        case PaymentStatus.processing: return "PROCESSING"
        case PaymentStatus.waitingForInput: return "WAITING_FOR_INPUT"
        default: return "UNKNOWN"
        }
    }

    class func mapFromConnectionStatus(_ connectionStatus: ConnectionStatus) -> String {
        switch connectionStatus {
        case ConnectionStatus.connected: return "CONNECTED"
        case ConnectionStatus.connecting: return "CONNECTING"
        case ConnectionStatus.notConnected: return "NOT_CONNECTED"
        case ConnectionStatus.reconnecting: return "RECONNECTING"
        default: return "UNKNOWN"
        }
    }

    class func mapFromReaderDisconnectReason(_ reason: DisconnectReason) -> String {
        switch reason {
        case DisconnectReason.disconnectRequested: return "DISCONNECT_REQUESTED"
        case DisconnectReason.rebootRequested: return "REBOOT_REQUESTED"
        case DisconnectReason.securityReboot: return "SECURITY_REBOOT"
        case DisconnectReason.criticallyLowBattery: return "CRITICALLY_LOW_BATTERY"
        case DisconnectReason.poweredOff: return "POWERED_OFF"
        case DisconnectReason.bluetoothDisabled: return "BLUETOOTH_DISABLED"
        default: return "UNKNOWN"
        }
    }
}
