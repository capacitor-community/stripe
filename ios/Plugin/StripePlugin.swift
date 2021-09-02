import Foundation
import Capacitor
import Stripe
import PassKit

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    private let paymentSheetExecutor = PaymentSheetExecutor()
    private let paymentFlowExecutor = PaymentFlowExecutor()
    private let applePayExecutor = ApplePayExecutor()

    @objc func initialize(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.paymentFlowExecutor.plugin = self
        self.applePayExecutor.plugin = self

        let publishableKey = call.getString("publishableKey") ?? ""
        let stripeAccount = call.getString("stripeAccount") ?? ""

        if publishableKey == "" {
            call.reject("you must provide publishableKey")
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

    @objc func createPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.createPaymentFlow(call)
    }

    @objc func presentPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.presentPaymentFlow(call)
    }

    @objc func confirmPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.confirmPaymentFlow(call)
    }

    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        self.applePayExecutor.isApplePayAvailable(call)
    }

    @objc func createApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.createApplePay(call)
    }

    @objc func presentApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.presentApplePay(call)
    }

    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }

    @objc func createGooglePay(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }

    @objc func presentGooglePay(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }
}
