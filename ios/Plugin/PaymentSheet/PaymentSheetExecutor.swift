import Foundation
import Capacitor
import Stripe

class PaymentSheetExecutor: NSObject {
    public weak var plugin: CAPPlugin?
    var paymentSheet: PaymentSheet?

    func createPaymentSheet(_ call: CAPPluginCall) {
        let paymentIntentClientSecret = call.getString("paymentIntentClientSecret") ?? nil
        let setupIntentClientSecret = call.getString("setupIntentClientSecret") ?? nil
        
        let customerId = call.getString("customerId") ?? nil
        let customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret") ?? nil
        
        if paymentIntentClientSecret == nil && setupIntentClientSecret == nil {
            self.plugin?.notifyListeners(PaymentSheetEvents.FailedToLoad.rawValue, data: [:])
            call.reject("Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret.")
            return
        }

        if customerId != nil && customerEphemeralKeySecret == nil {
            self.plugin?.notifyListeners(PaymentSheetEvents.FailedToLoad.rawValue, data: [:])
            call.reject("Invalid Params. When you set customerId, you must set customerEphemeralKeySecret.")
            return
        }

        // MARK: Create a PaymentSheet instance
        var configuration = PaymentSheet.Configuration()

        let merchantDisplayName = call.getString("merchantDisplayName") ?? ""
        if merchantDisplayName != "" {
            configuration.merchantDisplayName = merchantDisplayName
        }

        if #available(iOS 13.0, *) {
            let style = call.getString("style") ?? ""
            if style == "alwaysLight" {
                configuration.style = .alwaysLight
            } else if style == "alwaysDark" {
                configuration.style = .alwaysDark
            }
        }

        let applePayMerchantId = call.getString("applePayMerchantId") ?? ""

        if call.getBool("enableApplePay", false) && applePayMerchantId != "" {
            configuration.applePay = .init(
                merchantId: applePayMerchantId,
                merchantCountryCode: call.getString("countryCode", "US")
            )
        }

        if customerId != nil && customerEphemeralKeySecret != nil {
            configuration.customer = .init(id: customerId!, ephemeralKeySecret: customerEphemeralKeySecret!)
        }

        if setupIntentClientSecret != nil {
            self.paymentSheet = PaymentSheet(setupIntentClientSecret: setupIntentClientSecret!, configuration: configuration)
        } else {
            self.paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret!, configuration: configuration)
        }

        self.plugin?.notifyListeners(PaymentSheetEvents.Loaded.rawValue, data: [:])
        call.resolve([:])
    }

    func presentPaymentSheet(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                self.paymentSheet?.present(from: rootViewController) { paymentResult in
                    // MARK: Handle the payment result
                    switch paymentResult {
                    case .completed:
                        self.plugin?.notifyListeners(PaymentSheetEvents.Completed.rawValue, data: [:])
                        call.resolve(["paymentResult": PaymentSheetEvents.Completed.rawValue])
                    case .canceled:
                        self.plugin?.notifyListeners(PaymentSheetEvents.Canceled.rawValue, data: [:])
                        call.resolve(["paymentResult": PaymentSheetEvents.Canceled.rawValue])
                    case .failed(let error):
                        self.plugin?.notifyListeners(PaymentSheetEvents.Failed.rawValue, data: ["error": error.localizedDescription])
                        call.resolve(["paymentResult": PaymentSheetEvents.Failed.rawValue])
                    }
                }
            }
        }
    }
}
