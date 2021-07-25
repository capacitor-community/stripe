import Foundation
import Capacitor
import Stripe
import PassKit

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    private let paymentSheetExecutor = PaymentSheetExecutor()
    private let paymentFlowExecutor = PaymentFlowExecutor()

    @objc func initialize(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.paymentFlowExecutor.plugin = self
        
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
}
