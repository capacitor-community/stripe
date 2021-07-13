import Foundation
import Capacitor
import Stripe
import PassKit

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    internal var applePayCtx: ApplePayContext?
    private let paymentSheetExecutor = PaymentSheetExecutor()
    let applePayExecutor = ApplePayExecutor()

    @objc func initialize(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.applePayExecutor.plugin = self
        self.applePayExecutor.applePayCtx = self.applePayCtx

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
        self.paymentSheetExecutor.createPaymentSheet(call)
    }

    @objc func presentPaymentSheet(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.presentPaymentSheet(call)
    }

    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        self.applePayExecutor.isApplePayAvailable(call)
    }

    @objc func payWithApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.payWithApplePay(call)
    }

    @objc func cancelApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.cancelApplePay(call)
    }

    @objc func finalizeApplePayTransaction(_ call: CAPPluginCall) {
        self.applePayExecutor.finalizeApplePayTransaction(call)
    }

    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.reject("Google Pay is not available on iOS")
    }

    @objc func payWithGooglePay(_ call: CAPPluginCall) {
        call.reject("Google Pay is not available on iOS")
    }
}
