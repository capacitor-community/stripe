import Foundation
import Capacitor
import StripeTerminal

public class StripeTerminal: NSObject, DiscoveryDelegate, LocalMobileReaderDelegate, BluetoothReaderDelegate, TerminalDelegate, ReconnectionDelegate {

    weak var plugin: StripeTerminalPlugin?
    private let apiClient = APIClient()

    var discoverCancelable: Cancelable?
    var collectCancelable: Cancelable?
    var installUpdateCancelable: Cancelable?
    var cancelReaderConnectionCancellable: Cancelable?

    var discoverCall: CAPPluginCall?
    var locationId: String?
    var isTest: Bool?
    var type: DiscoveryMethod?
    var isInitialize: Bool = false
    var paymentIntent: PaymentIntent?

    var discoveredReadersList: [Reader]?

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
                // This call is passed to discoverCall. So not resolve.
            }
        }
    }

    public func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
        var readersJSObject: JSArray = []
        var i = 0
        for reader in readers {
            readersJSObject.append([
                "index": i
            ].merging(self.convertReaderInterface(reader: reader)) { (_, new) in new })
            i += 1
        }
        self.discoveredReadersList = readers

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
            call.resolve(["reader": self.convertReaderInterface(reader: reader)])
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
        let autoReconnectOnUnexpectedDisconnect = call.getBool("autoReconnectOnUnexpectedDisconnect", false)
        let merchantDisplayName: String? = call.getString("merchantDisplayName")
        let onBehalfOf: String? = call.getString("onBehalfOf")
        let reader: JSObject = call.getObject("reader")!
        let serialNumber: String = reader["serialNumber"] as! String

        let connectionConfig = try! LocalMobileConnectionConfigurationBuilder.init(locationId: self.locationId!)
            .setMerchantDisplayName(merchantDisplayName ?? nil)
            .setOnBehalfOf(onBehalfOf ?? nil)
            .setAutoReconnectOnUnexpectedDisconnect(autoReconnectOnUnexpectedDisconnect)
            .setAutoReconnectionDelegate(autoReconnectOnUnexpectedDisconnect ? self : nil)
            .build()

        guard let foundReader = self.discoveredReadersList?.first(where: { $0.serialNumber == serialNumber }) else {
            call.reject("reader is not match from descovered readers.")
            return
        }

        Terminal.shared.connectLocalMobileReader(foundReader, delegate: self, connectionConfig: connectionConfig) { reader, error in
            if let reader = reader {
                self.plugin?.notifyListeners(TerminalEvents.ConnectedReader.rawValue, data: [:])
                call.resolve()
            } else if let error = error {
                call.reject(error.localizedDescription)
            }
        }
    }

    private func connectInternetReader(_ call: CAPPluginCall) {
        let reader: JSObject = call.getObject("reader")!
        let serialNumber: String = reader["serialNumber"] as! String

        guard let foundReader = self.discoveredReadersList?.first(where: { $0.serialNumber == serialNumber }) else {
            call.reject("reader is not match from descovered readers.")
            return
        }

        let config = try! InternetConnectionConfigurationBuilder()
            .setFailIfInUse(true)
            .build()

        Terminal.shared.connectInternetReader(foundReader, connectionConfig: config) { reader, error in
            if let reader = reader {
                self.plugin?.notifyListeners(TerminalEvents.ConnectedReader.rawValue, data: [:])
                call.resolve()
            } else if let error = error {
                call.reject(error.localizedDescription)
            }
        }
    }

    private func connectBluetoothReader(_ call: CAPPluginCall) {
        let reader: JSObject = call.getObject("reader")!
        let serialNumber: String = reader["serialNumber"] as! String

        guard let foundReader = self.discoveredReadersList?.first(where: { $0.serialNumber == serialNumber }) else {
            call.reject("reader is not match from descovered readers.")
            return
        }

        let autoReconnectOnUnexpectedDisconnect = call.getBool("autoReconnectOnUnexpectedDisconnect", false)
        let merchantDisplayName: String? = call.getString("merchantDisplayName")
        let onBehalfOf: String? = call.getString("onBehalfOf")

        let config = try! BluetoothConnectionConfigurationBuilder(locationId: self.locationId!)
            .setAutoReconnectOnUnexpectedDisconnect(autoReconnectOnUnexpectedDisconnect)
            .setAutoReconnectionDelegate(autoReconnectOnUnexpectedDisconnect ? self : nil)
            .build()

        Terminal.shared.connectBluetoothReader(foundReader, delegate: self, connectionConfig: config) { reader, error in
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
                var errorDetails: [String: Any] = ["message": error.localizedDescription]
                call.reject(error.localizedDescription, nil, nil, errorDetails)
            } else if let paymentIntent = retrieveResult {
                self.collectCancelable = Terminal.shared.collectPaymentMethod(paymentIntent) { collectResult, collectError in
                    if let error = collectError {
                        self.plugin?.notifyListeners(TerminalEvents.Failed.rawValue, data: [:])
                        var errorDetails: [String: Any] = ["message": error.localizedDescription]
                        call.reject(error.localizedDescription, nil, nil, errorDetails)
                    } else if let paymentIntent = collectResult {
                        self.plugin?.notifyListeners(TerminalEvents.CollectedPaymentIntent.rawValue, data: [:])
                        self.paymentIntent = paymentIntent
                        call.resolve()
                    }
                }
            }
        }
    }

    public func confirmPaymentIntent(_ call: CAPPluginCall) {
        if let paymentIntent = self.paymentIntent {
            Terminal.shared.confirmPaymentIntent(paymentIntent) { confirmResult, confirmError in
                if let error = confirmError {
                    print("confirmPaymentIntent failed: \(error)")
                    self.plugin?.notifyListeners(TerminalEvents.Failed.rawValue, data: [:])
                    var errorDetails: [String: Any] = ["message": error.localizedDescription]
                    if let paymentIntent = error.paymentIntent,
                       let originalJSON = paymentIntent.originalJSON as? [AnyHashable: Any],
                       let lastPaymentError = originalJSON["last_payment_error"] as? [String: Any] {
                        if let errorCode = lastPaymentError["decline_code"] as? String {
                            errorDetails["declineCode"] = errorCode
                        }

                        if let errorCode = lastPaymentError["code"] as? String {
                            errorDetails["code"] = errorCode
                        }
                    }

                    call.reject(error.localizedDescription, nil, nil, errorDetails)
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
        Terminal.shared.simulatorConfiguration.availableReaderUpdate = TerminalMappers.mapToSimulateReaderUpdate(call.getString("update", "UPDATE_AVAILABLE"))
        Terminal.shared.simulatorConfiguration.simulatedCard = SimulatedCard(type: SimulatedCardType(rawValue: TerminalMappers.mapToCardType(type: call.getString("simulatedCard", "VISA")))!)
        if let tipAmount = call.getInt("simulatedTipAmount") {
            Terminal.shared.simulatorConfiguration.simulatedTipAmount = (tipAmount) as NSNumber
        }
        call.resolve([:])
    }

    public func installAvailableUpdate(_ call: CAPPluginCall) {
        Terminal.shared.installAvailableUpdate()
        call.resolve([:])
    }

    public func setReaderDisplay(_ call: CAPPluginCall) {
        guard let currency = call.getString("currency") else {
            call.reject("You must provide a currency value")
            return
        }
        guard let tax = call.getInt("tax") as? NSNumber else {
            call.reject("You must provide a tax value")
            return
        }
        guard let total = call.getInt("total") as? NSNumber else {
            call.reject("You must provide a total value")
            return
        }

        let cartBuilder = CartBuilder(currency: currency)
            .setTax(Int(truncating: tax))
            .setTotal(Int(truncating: total))

        let cartLineItems = TerminalMappers.mapToCartLineItems(call.getArray("lineItems") ?? JSArray())

        cartBuilder.setLineItems(cartLineItems)

        let cart: Cart
        do {
            cart = try cartBuilder.build()
        } catch {
            call.reject(error.localizedDescription)
            return
        }

        Terminal.shared.setReaderDisplay(cart) { error in
            if let error = error as NSError? {
                call.reject(error.localizedDescription)
            } else {
                call.resolve([:])
            }
        }

    }

    public func clearReaderDisplay(_ call: CAPPluginCall) {
        Terminal.shared.clearReaderDisplay { error in
            if let error = error as NSError? {
                call.reject(error.localizedDescription)
            } else {
                call.resolve([:])
            }
        }
    }

    public func rebootReader(_ call: CAPPluginCall) {
        Terminal.shared.rebootReader { error in
            if let error = error as NSError? {
                call.reject(error.localizedDescription)
            } else {
                self.paymentIntent = nil
                call.resolve([:])
            }
        }
    }

    /**
     *  Cancelable
     */
    public func cancelInstallUpdate(_ call: CAPPluginCall) {
        if let cancelable = self.installUpdateCancelable {
            if cancelable.completed {
                call.resolve()
                return
            }
            cancelable.cancel { error in
                if let error = error as NSError? {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve([:])
                }
            }
            return
        }
        call.resolve([:])
    }

    public func cancelCollectPaymentMethod(_ call: CAPPluginCall) {
        if let cancelable = self.collectCancelable {
            if cancelable.completed {
                call.resolve()
                return
            }
            cancelable.cancel { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    self.plugin?.notifyListeners(TerminalEvents.Canceled.rawValue, data: [:])
                    self.paymentIntent = nil
                    call.resolve()
                }
            }
            return
        }
        call.resolve()
    }

    func cancelDiscoverReaders(_ call: CAPPluginCall) {
        if let cancelable = self.discoverCancelable {
            if cancelable.completed {
                call.resolve()
                return
            }
            cancelable.cancel { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve()
                }
            }
            return
        }

        call.resolve()
    }

    public func cancelReaderReconnection(_ call: CAPPluginCall) {
        if let cancelable = self.cancelReaderConnectionCancellable {
            if cancelable.completed {
                call.resolve()
                return
            }
            cancelable.cancel { error in
                if let error = error as NSError? {
                    call.reject(error.localizedDescription)
                } else {
                    call.resolve([:])
                }
            }
            return
        }

        call.resolve()
    }

    /*
     * Terminal
     */
    public func terminal(_ terminal: Terminal, didChangePaymentStatus status: PaymentStatus) {
        self.plugin?.notifyListeners(TerminalEvents.PaymentStatusChange.rawValue, data: ["status": TerminalMappers.mapFromPaymentStatus(status)])
    }

    public func terminal(_ terminal: Terminal, didChangeConnectionStatus status: ConnectionStatus) {
        self.plugin?.notifyListeners(TerminalEvents.ConnectionStatusChange.rawValue, data: ["status": TerminalMappers.mapFromConnectionStatus(status)])
    }

    public func terminal(_ terminal: Terminal, didReportUnexpectedReaderDisconnect reader: Reader) {
        self.plugin?.notifyListeners(TerminalEvents.UnexpectedReaderDisconnect.rawValue, data: ["reader": self.convertReaderInterface(reader: reader)])
    }

    /*
     * localMobile
     */

    public func localMobileReader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        self.installUpdateCancelable = cancelable
        self.plugin?.notifyListeners(TerminalEvents.StartInstallingUpdate.rawValue, data: [
            "update": self.convertReaderSoftwareUpdate(update: update)
        ])
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
        self.plugin?.notifyListeners(TerminalEvents.RequestReaderInput.rawValue, data: ["options": TerminalMappers.mapFromReaderInputOptions(inputOptions), "message": inputOptions.rawValue])
    }

    public func localMobileReader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        let result = TerminalMappers.mapFromReaderDisplayMessage(displayMessage)

        self.plugin?.notifyListeners(TerminalEvents.RequestDisplayMessage.rawValue, data: [
            "messageType": result,
            "message": displayMessage.rawValue
        ])
    }

    /*
     * bluetooth
     */

    public func reader(_: Reader, didReportAvailableUpdate update: ReaderSoftwareUpdate) {
        self.plugin?.notifyListeners(TerminalEvents.ReportAvailableUpdate.rawValue, data: [
            "update": self.convertReaderSoftwareUpdate(update: update)
        ])
    }

    public func reader(_: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        self.installUpdateCancelable = cancelable
        self.plugin?.notifyListeners(TerminalEvents.StartInstallingUpdate.rawValue, data: [
            "update": self.convertReaderSoftwareUpdate(update: update)
        ])
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
        self.plugin?.notifyListeners(TerminalEvents.RequestReaderInput.rawValue, data: ["options": TerminalMappers.mapFromReaderInputOptions(inputOptions), "message": inputOptions.rawValue])
    }

    public func reader(_: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        let result = TerminalMappers.mapFromReaderDisplayMessage(displayMessage)

        self.plugin?.notifyListeners(TerminalEvents.RequestDisplayMessage.rawValue, data: [
            "messageType": result,
            "message": displayMessage.rawValue
        ])
    }

    public func reader(_ reader: Reader, didReportBatteryLevel batteryLevel: Float, status: BatteryStatus, isCharging: Bool) {
        self.plugin?.notifyListeners(TerminalEvents.BatteryLevel.rawValue, data: [
            "level": batteryLevel,
            "charging": isCharging,
            "status": TerminalMappers.mapFromBatteryStatus(status)
        ])
    }

    public func reader(_ reader: Reader, didReportReaderEvent event: ReaderEvent, info: [AnyHashable: Any]?) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderEvent.rawValue, data: [
            "event": TerminalMappers.mapFromReaderEvent(event)
        ])
    }

    public func reader(_ reader: Reader, didDisconnect reason: DisconnectReason) {
        self.plugin?.notifyListeners(TerminalEvents.DisconnectedReader.rawValue, data: [
            "reason": TerminalMappers.mapFromReaderDisconnectReason(reason)
        ])
    }

    /*
     * Reconnection
     */
    public func reader(_ reader: Reader, didStartReconnect cancelable: Cancelable, disconnectReason: DisconnectReason) {
        self.cancelReaderConnectionCancellable = cancelable
        self.plugin?.notifyListeners(TerminalEvents.ReaderReconnectStarted.rawValue, data: ["reader": self.convertReaderInterface(reader: reader), "reason": disconnectReason.rawValue])
    }

    public func readerDidSucceedReconnect(_ reader: Reader) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderReconnectSucceeded.rawValue, data: ["reader": self.convertReaderInterface(reader: reader)])
    }

    public func readerDidFailReconnect(_ reader: Reader) {
        self.plugin?.notifyListeners(TerminalEvents.ReaderReconnectFailed.rawValue, data: ["reader": self.convertReaderInterface(reader: reader)])
    }

    /*
     * Private
     */
    private func convertReaderInterface(reader: Reader) -> JSObject {
        return [
            "label": reader.label ?? NSNull(),
            "batteryLevel": (reader.batteryLevel ?? 0).intValue,
            "batteryStatus": TerminalMappers.mapFromBatteryStatus(reader.batteryStatus),
            "simulated": reader.simulated,
            "serialNumber": reader.serialNumber,
            "isCharging": (reader.isCharging ?? 0).intValue,
            "id": reader.stripeId ?? NSNull(),
            "availableUpdate": TerminalMappers.mapFromReaderSoftwareUpdate(reader.availableUpdate),
            "locationId": reader.locationId ?? NSNull(),
            "ipAddress": reader.ipAddress ?? NSNull(),
            "status": TerminalMappers.mapFromReaderNetworkStatus(reader.status),
            "location": TerminalMappers.mapFromLocation(reader.location),
            "locationStatus": TerminalMappers.mapFromLocationStatus(reader.locationStatus),
            "deviceType": TerminalMappers.mapFromDeviceType(reader.deviceType),
            "deviceSoftwareVersion": reader.deviceSoftwareVersion ?? NSNull()
        ]
    }

    private func convertReaderSoftwareUpdate(update: ReaderSoftwareUpdate) -> JSObject {
        return TerminalMappers.mapFromReaderSoftwareUpdate(update)
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

extension UInt {
    init(bitComponents: [UInt]) {
        self = bitComponents.reduce(0, +)
    }

    func bitComponents() -> [UInt] {
        return (0 ..< 8*MemoryLayout<UInt>.size).map({ 1 << $0 }).filter({ self & $0 != 0 })
    }
}
