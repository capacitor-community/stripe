import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": value
        ])
    }

    @objc func setPublishableKey(_ call: CAPPluginCall) {}
    @objc func createCardToken(_ call: CAPPluginCall) {}
    @objc func createBankAccountToken(_ call: CAPPluginCall) {}
    @objc func confirmPaymentIntent(_ call: CAPPluginCall) {}
    @objc func startApplePayTransaction(_ call: CAPPluginCall) {}
    @objc func finalizeApplePayTransaction(_ call: CAPPluginCall) {}
    @objc func createSourceToken(_ call: CAPPluginCall) {}
    @objc func createPiiToken(_ call: CAPPluginCall) {}
    @objc func createAccountToken(_ call: CAPPluginCall) {}
    @objc func validateCardNumber(_ call: CAPPluginCall) {}
    @objc func validateExpiryDate(_ call: CAPPluginCall) {}
    @objc func validateCVC(_ call: CAPPluginCall) {}
    @objc func identifyCardBrand(_ call: CAPPluginCall) {}
    @objc func confirmPaymentIntent(_ call: CAPPluginCall) {}
    @objc func confirmSetupIntent(_ call: CAPPluginCall) {}
    @objc func customizePaymentAuthUI(_ call: CAPPluginCall) {}
    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {}
    @objc func startGooglePayTransaction(_ call: CAPPluginCall) {}
}
