import Foundation
import Capacitor
import StripeTerminal

public class StripeTerminal: NSObject, DiscoveryDelegate, LocalMobileReaderDelegate {

    weak var plugin: StripeTerminalPlugin?
    var discoverCancelable: Cancelable?
    var discoverCall: CAPPluginCall?
    var locationId: String?
    var isTest: Bool?
    var collectCancelable: Cancelable?

    var readers: [Reader]?

    @objc public func initialize(_ call: CAPPluginCall) {
        self.isTest = call.getBool("isTest", true)
        Terminal.setTokenProvider(APIClient(tokenProviderEndpoint: call.getString("tokenProviderEndpoint", "")))
        self.plugin?.notifyListeners(TerminalEvents.Loaded.rawValue, data: [:])
        call.resolve()
    }

    func discoverReaders(_ call: CAPPluginCall) {
        let config = DiscoveryConfiguration(
            discoveryMethod: .localMobile,
            simulated: self.isTest
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
