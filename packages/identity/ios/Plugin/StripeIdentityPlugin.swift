import Foundation
import Capacitor
import StripeIdentity
import PassKit

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(StripeIdentityPlugin)
public class StripeIdentityPlugin: CAPPlugin {
    private let implementation = StripeIdentity()

    override public func load() {
        super.load()
        self.implementation.plugin = self
        STPAPIClient.shared.appInfo = STPAppInfo(name: "@capacitor-community/stripe-identity", partnerId: nil, version: nil, url: nil)
    }
    
    @objc func initialize(_ call: CAPPluginCall) {
        self.implementation.initialize(call)
    }

    @objc func create(_ call: CAPPluginCall) {
        self.implementation.create(call)
    }

    @objc func present(_ call: CAPPluginCall) {
        self.implementation.present(call)
    }

    func getRootVC() -> UIViewController? {
        var window: UIWindow? = UIApplication.shared.delegate?.window ?? nil

        if window == nil {
            let scene: UIWindowScene? = UIApplication.shared.connectedScenes.first as? UIWindowScene
            window = scene?.windows.filter({$0.isKeyWindow}).first
            if window == nil {
                window = scene?.windows.first
            }
        }
        return window?.rootViewController
    }
}
