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

    @objc func setConnectionToken(_ call: CAPPluginCall) {
        self.implementation.setConnectionToken(call)
    }

    @objc func discoverReaders(_ call: CAPPluginCall) {
        do {
            try self.implementation.discoverReaders(call)
        } catch {
            call.reject("discoverReaders throw error.")
        }
    }

    @objc func cancelDiscoverReaders(_ call: CAPPluginCall) {
        self.implementation.cancelDiscoverReaders(call)
    }

    @objc func connectReader(_ call: CAPPluginCall) {
        self.implementation.connectReader(call)
    }

    @objc func getConnectedReader(_ call: CAPPluginCall) {
        self.implementation.getConnectedReader(call)
    }

    @objc func disconnectReader(_ call: CAPPluginCall) {
        self.implementation.disconnectReader(call)
    }

    @objc func collect(_ call: CAPPluginCall) {
        self.implementation.collect(call)
    }

    @objc func cancelCollect(_ call: CAPPluginCall) {
        self.implementation.cancelCollect(call)
    }
}
