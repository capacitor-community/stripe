import Foundation
import StripeTerminal
import Capacitor
import PassKit

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(StripeTerminalPlugin)
public class StripeTerminalPlugin: CAPPlugin {
    private let implementation = StripeTerminal()

    override public func load() {
        super.load()
        self.implementation.plugin = self
        // TODO: add STPAPIClient.shared.appInfo
    }

    @objc func initialize(_ call: CAPPluginCall) {
        self.implementation.initialize(call)
    }

    @objc func discoverReaders(_ call: CAPPluginCall) {
        self.implementation.discoverReaders(call)
    }

    @objc func connectReader(_ call: CAPPluginCall) {
    }

    @objc func collect(_ call: CAPPluginCall) {
    }
}
