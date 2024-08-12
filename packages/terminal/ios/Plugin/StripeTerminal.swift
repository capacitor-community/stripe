import Foundation
import Capacitor
import StripeTerminal

public class StripeTerminal: NSObject, DiscoveryDelegate, LocalMobileReaderDelegate, BluetoothReaderDelegate, TerminalDelegate {

    weak var plugin: StripeTerminalPlugin?
    private let apiClient = APIClient()
    var discoverCancelable: Cancelable?
    var discoverCall: CAPPluginCall?
    var locationId: String?
    var isTest: Bool?
    var collectCancelable: Cancelable?
    var type: DiscoveryMethod?
    var isInitialize: Bool = false
    var paymentIntent: PaymentIntent?

    var readers: [Reader]?

    @objc public func initialize(_ call: CAPPluginCall) {
        self.isTest = call.getBool("isTest", true)
        if self.isInitialize == false {
            apiClient.initialize(plugin: self.plugin, tokenProviderEndpoint: call.getString("tokenProviderEndpoint", ""))
            Terminal.setTokenProvider(apiClient)
        }
        self.isInitialize = true
        self.plugin?.notifyListeners(TerminalEvents.Loaded.rawValue, data: [:])
        call.resolve()
    }

    func setConnectionToken(_ call: CAPPluginCall) {
        self.apiClient.setConnectionToken(call)
    }

    func discoverReaders(_ call: CAPPluginCall) throws {
        let connectType = call.getString("type")
        let config: DiscoveryConfiguration
        self.locationId = call.getString("locationId")

        if TerminalConnectTypes.TapToPay.rawValue == connectType {
            self.type = .localMobile
            config = try LocalMobileDiscoveryConfigurationBuilder().setSimulated(self.isTest!).build()
        } else if TerminalConnectTypes.Internet.rawValue == connectType {
            self.type = .internet
            config = try InternetDiscoveryConfigurationBuilder()
                .setLocationId(self.locationId)
                .setSimulated(self.isTest!)
                .build()
        } else if TerminalConnectTypes.Bluetooth.rawValue == connectType {
            self.type = DiscoveryMethod.bluetoothScan
            config = try BluetoothScanDiscoveryConfigurationBuilder().setSimulated(self.isTest!).build()
        } else {
            call.unimplemented(connectType! + " is not support now")
            return
        }

        self.discoverCall = call
        self.discoverCancelable = Terminal.shared.discoverReaders(config, delegate: self) { error in
            if let error = error {
                print("discoverReaders failed: \(error)")
                call.reject(error.localizedDescription)
                self.discoverCall = nil
            } else {
            }
        }
    }

    func cancelDiscoverReaders(_ call: CAPPluginCall) {

        if let cancelable = self.discoverCancelable {
            cancelable.cancel { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    self.collectCancelable = nil
                    call.resolve()
                }
            }
            return
        }

        call.resolve()
    }

    public func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
        var readersJSObject: JSArray = []
        var i = 0
        for reader in readers {
            readersJSObject.append([
                "index": i,
                "serialNumber": reader.serialNumber
            ])
            i += 1
        }
        self.readers = readers

        self.plugin?.notifyListeners(TerminalEvents.DiscoveredReaders.rawValue, data: ["readers": readersJSObject])
        self.discoverCall?.resolve([
            "readers": readersJSObject
        ])
    }

    public func connectReader(_ call: CAPPluginCall) {
        if self.type == .localMobile {
            self.connectLocalMobileReader(call)
        } else if self.type == .internet {
            self.connectInternetReader(call)
        } else {
            // if self.type === DiscoveryMethod.bluetoothScan
            self.connectBluetoothReader(call)
        }
    }

    public func getConnectedReader(_ call: CAPPluginCall) {
        if let reader = Terminal.shared.connectedReader {
            call.resolve(["reader": [
                "serialNumber": reader.serialNumber
            ]])
        } else {
            call.resolve(["reader": nil])
        }
    }

    public func disconnectReader(_ call: CAPPluginCall) {
        if Terminal.shared.connectedReader == nil {
            call.resolve()
            return
        }

        DispatchQueue.main.async {
            Terminal.shared.disconnectReader { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    self.plugin?.notifyListeners(TerminalEvents.DisconnectedReader.rawValue, data: [:])
                    call.resolve()
                }
            }
        }
    }

    private func connectLocalMobileReader(_ call: CAPPluginCall) {
        let connectionConfig = try! LocalMobileConnectionConfigurationBuilder.init(locationId: self.locationId!).build()
        let reader: JSObject = call.getObject("reader")!
        let index: Int = reader["index"] as! Int

        Terminal.shared.connectLocalMobileReader(self.readers![index], delegate: self, connectionConfig: connectionConfig) { reader, error in
            if let reader = reader {
                self.plugin?.notifyListeners(TerminalEvents.ConnectedReader.rawValue, data: [:])
                call.resolve()
            } else if let error = error {
                call.reject(error.localizedDescription)
            }
        }
    }

    private func connectInternetReader(_ call: CAPPluginCall) {
        let config = try! InternetConnectionConfigurationBuilder()
            .setFailIfInUse(true)
            .build()
        let reader: JSObject = call.getObject("reader")!
        let index: Int = reader["index"] as! Int

        Terminal.shared.connectInternetReader(self.readers![index], connectionConfig: config) { reader, error in
            if let reader = reader {
                self.plugin?.notifyListeners(TerminalEvents.ConnectedReader.rawValue, data: [:])
                call.resolve()
            } else if let error = error {
                call.reject(error.localizedDescription)
            }
        }
    }

    private func connectBluetoothReader(_ call: CAPPluginCall) {
        let config = try! BluetoothConnectionConfigurationBuilder(locationId: self.locationId!).build()
        let reader: JSObject = call.getObject("reader")!
        let index: Int = reader["index"] as! Int

        Terminal.shared.connectBluetoothReader(self.readers![index], delegate: self, connectionConfig: config) { reader, error in
            if let reader = reader {
                self.plugin?.notifyListeners(TerminalEvents.ConnectedReader.rawValue, data: [:])
                call.resolve()
            } else if let error = error {
                call.reject(error.localizedDescription)
            }
        }
    }

    public func collectPaymentMethod(_ call: CAPPluginCall) {
        Terminal.shared.retrievePaymentIntent(clientSecret: call.getString("paymentIntent")!) { retrieveResult, retrieveError in
            if let error = retrieveError {
                print("retrievePaymentIntent failed: \(error)")
            } else if let paymentIntent = retrieveResult {
                self.collectCancelable = Terminal.shared.collectPaymentMethod(paymentIntent) { collectResult, collectError in
                    if let error = collectError {
                        self.plugin?.notifyListeners(TerminalEvents.Failed.rawValue, data: [:])
                        call.reject(error.localizedDescription)
                    } else if let paymentIntent = collectResult {
                        self.plugin?.notifyListeners(TerminalEvents.CollectedPaymentIntent.rawValue, data: [:])
                        self.paymentIntent = paymentIntent
                        call.resolve()
                    }
                }
            }
        }
    }

    public func cancelCollectPaymentMethod(_ call: CAPPluginCall) {
        if let cancelable = self.collectCancelable {
            cancelable.cancel { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    self.plugin?.notifyListeners(TerminalEvents.Canceled.rawValue, data: [:])
                    self.collectCancelable = nil
                    self.paymentIntent = nil
                    call.resolve()
                }
            }
            return
        }
        call.resolve()
    }

    public func confirmPaymentIntent(_ call: CAPPluginCall) {
        if let paymentIntent = self.paymentIntent {
            Terminal.shared.confirmPaymentIntent(paymentIntent) { confirmResult, confirmError in
                if let error = confirmError {
                    print("confirmPaymentIntent failed: \(error)")
                    self.plugin?.notifyListeners(TerminalEvents.Failed.rawValue, data: [:])
                    call.reject(error.localizedDescription)
                } else if let confirmedIntent = confirmResult {
                    print("PaymentIntent confirmed: \(confirmedIntent)")
                    self.plugin?.notifyListeners(TerminalEvents.ConfirmedPaymentIntent.rawValue, data: [:])
                    call.resolve()
                }
            }
        } else {
            call.reject("PaymentIntent not found for confirmPaymentIntent. Use collect method first and try again.")
        }
    }

    public func setSimulatorConfiguration(_ call: CAPPluginCall) {
        // { update?: SimulateReaderUpdate; simulatedCard?: SimulatedCardType; simulatedTipAmount?: number; }
        Terminal.shared.simulatorConfiguration.availableReaderUpdate = self.mapToSimulateReaderUpdate(call.getString("update", "UPDATE_AVAILABLE"))
        Terminal.shared.simulatorConfiguration.simulatedCard = SimulatedCard(type: SimulatedCardType(rawValue: self.mapToCardType(type: call.getString("simulatedCard", "VISA")))!)
        if let tipAmount = call.getInt("simulatedTipAmount") {
            Terminal.shared.simulatorConfiguration.simulatedTipAmount = (tipAmount) as NSNumber
        }
        call.resolve([:])
    }


    /*
     * Terminal
     */
    public func terminal(_ terminal: Terminal, didChangePaymentStatus status: PaymentStatus) {
        self.plugin?.notifyListeners(TerminalEvents.PaymentStatusChange.rawValue, data: ["status": status.rawValue])
    }

    public func terminal(_ terminal: Terminal, didChangeConnectionStatus status: ConnectionStatus) {
        self.plugin?.notifyListeners(TerminalEvents.ConnectionStatusChange.rawValue, data: ["status": status.rawValue])
    }

    public func terminal(_ terminal: Terminal, didReportUnexpectedReaderDisconnect reader: Reader) {
        self.plugin?.notifyListeners(TerminalEvents.UnexpectedReaderDisconnect.rawValue, data: ["reader": self.convertReaderInterface(reader: reader)])
    }

    /*
     * localMobile
     */

    public func localMobileReader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        self.plugin?.notifyListeners(TerminalEvents.StartInstallingUpdate.rawValue, data: self.convertReaderSoftwareUpdate(update: update))
    }

    public func localMobileReader(_ reader: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderSoftwareUpdateProgress.rawValue, data: ["progress": progress])
    }

    public func localMobileReader(_ reader: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
        if (error) != nil {
            self.plugin?.notifyListeners(TerminalEvents.FinishInstallingUpdate.rawValue, data: [
                "error": error!.localizedDescription
            ])
            return
        }
        self.plugin?.notifyListeners(TerminalEvents.FinishInstallingUpdate.rawValue, data: [
            "update": self.convertReaderSoftwareUpdate(update: update!)
        ])
    }

    public func localMobileReader(_ reader: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
        var readersJSObject: JSArray = []

        if inputOptions.contains(.swipeCard) {
            readersJSObject.append(String(ReaderInputOptions.swipeCard.rawValue))
        }
        if inputOptions.contains(.insertCard) {
            readersJSObject.append(String(ReaderInputOptions.insertCard.rawValue))
        }
        if inputOptions.contains(.tapCard) {
            readersJSObject.append(String(ReaderInputOptions.tapCard.rawValue))
        }

        self.plugin?.notifyListeners(TerminalEvents.RequestReaderInput.rawValue, data: ["options": readersJSObject, "message": inputOptions.rawValue])
    }

    public func localMobileReader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        self.plugin?.notifyListeners(TerminalEvents.RequestDisplayMessage.rawValue, data: [
            "messageType": displayMessage.rawValue,
            "message": displayMessage.rawValue
        ])
    }

    /*
     * bluetooth
     */

    public func reader(_: Reader, didReportAvailableUpdate update: ReaderSoftwareUpdate) {
        // TODO
    }

    public func reader(_: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        self.plugin?.notifyListeners(TerminalEvents.StartInstallingUpdate.rawValue, data: self.convertReaderSoftwareUpdate(update: update))
    }

    public func reader(_: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderSoftwareUpdateProgress.rawValue, data: ["progress": progress])
    }

    public func reader(_: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
        if (error) != nil {
            self.plugin?.notifyListeners(TerminalEvents.FinishInstallingUpdate.rawValue, data: [
                "error": error!.localizedDescription
            ])
            return
        }
        self.plugin?.notifyListeners(TerminalEvents.FinishInstallingUpdate.rawValue, data: [
            "update": self.convertReaderSoftwareUpdate(update: update!)
        ])
    }

    public func reader(_: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
        var readersJSObject: JSArray = []

        if inputOptions.contains(.swipeCard) {
            readersJSObject.append(String(ReaderInputOptions.swipeCard.rawValue))
        }
        if inputOptions.contains(.insertCard) {
            readersJSObject.append(String(ReaderInputOptions.insertCard.rawValue))
        }
        if inputOptions.contains(.tapCard) {
            readersJSObject.append(String(ReaderInputOptions.tapCard.rawValue))
        }

        self.plugin?.notifyListeners(TerminalEvents.RequestReaderInput.rawValue, data: ["options": readersJSObject, "message": inputOptions.rawValue])
    }

    public func reader(_: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        let result = self.mapFromReaderDisplayMessage(displayMessage)
        
        self.plugin?.notifyListeners(TerminalEvents.RequestDisplayMessage.rawValue, data: [
            "messageType": result,
            "message": displayMessage.rawValue
        ])
    }

    public func reader(_ reader: Reader, didReportBatteryLevel batteryLevel: Float, status: BatteryStatus, isCharging: Bool) {
        self.plugin?.notifyListeners(TerminalEvents.BatteryLevel.rawValue, data: [
            "level": batteryLevel,
            "charging": isCharging,
            "status": status.rawValue
        ])
    }

    public func reader(_ reader: Reader, didReportReaderEvent event: ReaderEvent, info: [AnyHashable: Any]?) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderEvent.rawValue, data: [
            "event": event.rawValue
        ])
    }

    private func convertReaderInterface(reader: Reader) -> [String: String] {
        return ["serialNumber": reader.serialNumber]
    }

    private func convertReaderSoftwareUpdate(update: ReaderSoftwareUpdate) -> [String: String] {
        return [
            "version": update.deviceSoftwareVersion,
            "settingsVersion": update.deviceSoftwareVersion,
            "requiredAt": update.requiredAt.description,
            "timeEstimate": String(update.estimatedUpdateTime.rawValue)
        ]
    }
    
    private func mapToSimulateReaderUpdate(_ update: String) -> SimulateReaderUpdate {
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

    private func mapToCardType(type: String) -> UInt {
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
    
    private func mapFromReaderDisplayMessage(_ displayMessage: ReaderDisplayMessage) -> String {
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
}

class APIClient: ConnectionTokenProvider {
    weak var plugin: StripeTerminalPlugin?
    var tokenProviderEndpoint: String = ""
    private var pendingCompletion: ConnectionTokenCompletionBlock?

    func initialize(plugin: StripeTerminalPlugin?, tokenProviderEndpoint: String) {
        self.plugin = plugin
        self.tokenProviderEndpoint = tokenProviderEndpoint
    }

    func setConnectionToken(_ call: CAPPluginCall) {
        let token = call.getString("token", "")
        if let completion = pendingCompletion {
            if token == "" {
                let error = NSError(domain: "com.getcapacitor.community.stripe.terminal",
                                    code: 3000,
                                    userInfo: [NSLocalizedDescriptionKey: "Missing `token` is empty"])
                completion(nil, error)
                call.reject("Missing `token` is empty")
            } else {
                completion(token, nil)
                call.resolve()
            }
            pendingCompletion = nil
        } else {
            call.reject("Stripe Terminal do not pending fetchConnectionToken")
        }
    }

    // Fetches a ConnectionToken from your backend
    func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) {
        if tokenProviderEndpoint == "" {
            pendingCompletion = completion
            self.plugin?.notifyListeners(TerminalEvents.RequestedConnectionToken.rawValue, data: [:])
        } else {
            let config = URLSessionConfiguration.default
            let session = URLSession(configuration: config)
            guard let url = URL(string: tokenProviderEndpoint) else {
                fatalError("Invalid backend URL")
            }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            let task = session.dataTask(with: request) { (data, _, error) in
                if let data = data {
                    do {
                        // Warning: casting using `as? [String: String]` looks simpler, but isn't safe:
                        let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                        if let secret = json?["secret"] as? String {
                            completion(secret, nil)
                        } else {
                            let error = NSError(domain: "com.getcapacitor.community.stripe.terminal",
                                                code: 2000,
                                                userInfo: [NSLocalizedDescriptionKey: "Missing `secret` in ConnectionToken JSON response"])
                            completion(nil, error)
                        }
                    } catch {
                        completion(nil, error)
                    }
                } else {
                    let error = NSError(domain: "com.getcapacitor.community.stripe.terminal",
                                        code: 1000,
                                        userInfo: [NSLocalizedDescriptionKey: "No data in response from ConnectionToken endpoint"])
                    completion(nil, error)
                }
            }
            task.resume()
        }
    }
}
