import Foundation
import Capacitor
import StripeTerminal

public class StripeTerminal: NSObject, DiscoveryDelegate, LocalMobileReaderDelegate, BluetoothReaderDelegate {

    weak var plugin: StripeTerminalPlugin?
    var discoverCancelable: Cancelable?
    var discoverCall: CAPPluginCall?
    var locationId: String?
    var isTest: Bool?
    var collectCancelable: Cancelable?
    var type: DiscoveryMethod?
    var isInitialize: Bool = false

    var readers: [Reader]?

    @objc public func initialize(_ call: CAPPluginCall) {
        self.isTest = call.getBool("isTest", true)
        if self.isInitialize == false {
            Terminal.setTokenProvider(APIClient(tokenProviderEndpoint: call.getString("tokenProviderEndpoint", "")))
        }
        self.isInitialize = true
        self.plugin?.notifyListeners(TerminalEvents.Loaded.rawValue, data: [:])
        call.resolve()
    }

    func discoverReaders(_ call: CAPPluginCall) throws {
        let connectType = call.getString("type")

        if TerminalConnectTypes.TapToPay.rawValue == connectType {
            self.type = .localMobile
        } else if TerminalConnectTypes.Internet.rawValue == connectType {
            self.type = .internet
        }  else if TerminalConnectTypes.Bluetooth.rawValue == connectType {
            self.type = DiscoveryMethod.bluetoothScan
        } else {
            call.unimplemented(connectType! + " is not support now")
            return
        }

        
        let config = DiscoveryConfiguration(
            discoveryMethod: self.type!,
            simulated: self.isTest!
        )

        self.discoverCall = call
        self.locationId = call.getString("locationId")

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
        let connectionConfig = LocalMobileConnectionConfiguration(locationId: self.locationId!)
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
        let config = InternetConnectionConfiguration(failIfInUse: true)
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
        let config = BluetoothConnectionConfiguration(locationId: self.locationId!)
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

    public func collect(_ call: CAPPluginCall) {
        Terminal.shared.retrievePaymentIntent(clientSecret: call.getString("paymentIntent")!) { retrieveResult, retrieveError in
            if let error = retrieveError {
                print("retrievePaymentIntent failed: \(error)")
            } else if let paymentIntent = retrieveResult {
                self.collectCancelable = Terminal.shared.collectPaymentMethod(paymentIntent) { collectResult, collectError in
                    if let error = collectError {
                        self.plugin?.notifyListeners(TerminalEvents.Failed.rawValue, data: [:])
                        call.reject(error.localizedDescription)
                    } else if let paymentIntent = collectResult {
                        self.plugin?.notifyListeners(TerminalEvents.Completed.rawValue, data: [:])
                        call.resolve()
                    }
                }
            }
        }
    }

    public func cancelCollect(_ call: CAPPluginCall) {
        if let cancelable = self.collectCancelable {
            cancelable.cancel { error in
                if let error = error {
                    call.reject(error.localizedDescription)
                } else {
                    self.plugin?.notifyListeners(TerminalEvents.Canceled.rawValue, data: [:])
                    self.collectCancelable = nil
                    call.resolve()
                }
            }
            return
        }
        call.resolve()
    }
    

    // localMobile
    
    public func localMobileReader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        // TODO
    }

    public func localMobileReader(_ reader: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
        // TODO
    }

    public func localMobileReader(_ reader: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
        // TODO
    }

    public func localMobileReader(_ reader: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
        // TODO
    }

    public func localMobileReader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        // TODO
    }
    
    
    // bluetooth
    
    public func reader(_: Reader, didReportAvailableUpdate update: ReaderSoftwareUpdate) {
        // TODO
    }
    
    public func reader(_: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        // TODO
    }
    
    public func reader(_: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
        // TODO
    }
    
    public func reader(_: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
        // TODO
    }
    
    public func reader(_: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
        // TODO
    }
    
    public func reader(_: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        // TODO
    }
}

class APIClient: ConnectionTokenProvider {
    var tokenProviderEndpoint: String = ""

    init(tokenProviderEndpoint: String) {
        self.tokenProviderEndpoint = tokenProviderEndpoint
    }

    // Fetches a ConnectionToken from your backend
    func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) {
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
