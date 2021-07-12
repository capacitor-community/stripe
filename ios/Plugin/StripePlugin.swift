import Foundation
import Capacitor
import Stripe
import PassKit

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(StripePlugin)
public class StripePlugin: CAPPlugin {

    @objc func initialize(_ call: CAPPluginCall) {
        let publishableKey = call.getString("publishableKey") ?? ""
        let stripeAccount = call.getString("stripeAccount") ?? ""

        if publishableKey == "" {
            call.reject("you must provide a valid key")
            return
        }
        
        if stripeAccount != "" {
            STPAPIClient.shared.stripeAccount = stripeAccount
        }

        StripeAPI.defaultPublishableKey = publishableKey

        call.resolve()
    }
    
    @objc func createPaymentSheet(_ call: CAPPluginCall) {
        PaymentSheetExecutor.createPaymentSheet(call);
    }
    
    @objc func presentPaymentSheet(_ call: CAPPluginCall) {
        PaymentSheetExecutor.presentPaymentSheet(call);
    }
    
    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        ApplePayExecutor.isApplePayAvailable(call);
    }

    @objc func payWithApplePay(_ call: CAPPluginCall) {
        ApplePayExecutor.payWithApplePay(call);
    }

    @objc func cancelApplePay(_ call: CAPPluginCall) {
        ApplePayExecutor.cancelApplePay(call);
    }

    @objc func finalizeApplePayTransaction(_ call: CAPPluginCall) {
        ApplePayExecutor.finalizeApplePayTransaction(call);
    }
    
    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.reject("Google Pay is not available on iOS")
    }

    @objc func payWithGooglePay(_ call: CAPPluginCall) {
        call.reject("Google Pay is not available on iOS")
    }
}
