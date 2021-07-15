import Foundation
import Capacitor
import Stripe
import PassKit
import UIKit

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    private let paymentSheetExecutor = PaymentSheetExecutor()
    private let cardInputModalExecutor = CardInputModalExecutor()
    

    @objc func initialize(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.cardInputModalExecutor.plugin = self
        
        self.cardInputModalExecutor.presentCardInputModal()

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
}
