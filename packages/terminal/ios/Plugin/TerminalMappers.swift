import StripeTerminal
import Capacitor

class TerminalMappers {
    class func mapToSimulateReaderUpdate(_ update: String) -> SimulateReaderUpdate {
        switch update {
        case "UpdateAvailable": return SimulateReaderUpdate.available
        case "None": return SimulateReaderUpdate.none
        case "Random": return SimulateReaderUpdate.random
        case "Required": return SimulateReaderUpdate.required
        case "LowBattery": return SimulateReaderUpdate.lowBattery
        case "LowBatterySucceedConnect": return SimulateReaderUpdate.lowBatterySucceedConnect
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
