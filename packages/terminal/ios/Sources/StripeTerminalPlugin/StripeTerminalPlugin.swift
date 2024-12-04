import Foundation
import StripeTerminal
import Capacitor
import PassKit

@objc(StripeTerminalPlugin)
public class StripeTerminalPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StripeTerminalPlugin"
    public let jsName = "StripeTerminal"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setConnectionToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "discoverReaders", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelDiscoverReaders", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "connectReader", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getConnectedReader", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnectReader", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "collectPaymentMethod", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelCollectPaymentMethod", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "confirmPaymentIntent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSimulatorConfiguration", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "installAvailableUpdate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelInstallUpdate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setReaderDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearReaderDisplay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "rebootReader", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancelReaderReconnection", returnType: CAPPluginReturnPromise)
    ]
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

    @objc func setSimulatorConfiguration(_ call: CAPPluginCall) {
        self.implementation.setSimulatorConfiguration(call)
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

    @objc func collectPaymentMethod(_ call: CAPPluginCall) {
        self.implementation.collectPaymentMethod(call)
    }

    @objc func cancelCollectPaymentMethod(_ call: CAPPluginCall) {
        self.implementation.cancelCollectPaymentMethod(call)
    }

    @objc func confirmPaymentIntent(_ call: CAPPluginCall) {
        self.implementation.confirmPaymentIntent(call)
    }

    @objc func installAvailableUpdate(_ call: CAPPluginCall) {
        self.implementation.installAvailableUpdate(call)
    }

    @objc func cancelInstallUpdate(_ call: CAPPluginCall) {
        self.implementation.cancelInstallUpdate(call)
    }

    @objc func setReaderDisplay(_ call: CAPPluginCall) {
        self.implementation.setReaderDisplay(call)
    }

    @objc func clearReaderDisplay(_ call: CAPPluginCall) {
        self.implementation.clearReaderDisplay(call)
    }

    @objc func rebootReader(_ call: CAPPluginCall) {
        self.implementation.rebootReader(call)
    }

    @objc func cancelReaderReconnection(_ call: CAPPluginCall) {
        self.implementation.cancelReaderReconnection(call)
    }

}
