import Foundation
import Capacitor
import StripeTerminal

public class StripeTerminal: NSObject, DiscoveryDelegate {

    weak var plugin: StripeTerminalPlugin?
    var discoverCancelable: Cancelable?

    @objc public func initialize(_ call: CAPPluginCall) {
        Terminal.setTokenProvider(APIClient(tokenProviderEndpoint: call.getString("tokenProviderEndpoint", "")))
        call.resolve()
    }

    func discoverReaders(_ call: CAPPluginCall) {
        let config = DiscoveryConfiguration(
            discoveryMethod: .localMobile,
            simulated: false
        )

        self.discoverCancelable = Terminal.shared.discoverReaders(config, delegate: self) { error in
            if let error = error {
                print("discoverReaders failed: \(error)")
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    public func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
        print(readers)
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
