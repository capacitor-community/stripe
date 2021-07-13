import Foundation
import Capacitor
import Stripe

class PaymentSheetExecutor: NSObject {
    public weak var plugin: CAPPlugin?
    var paymentSheet: PaymentSheet?

    func createPaymentSheet(_ call: CAPPluginCall) {
        let paymentIntentUrl = call.getString("paymentIntentUrl") ?? ""
        if paymentIntentUrl == "" {
            return
        }

        let backendCheckoutUrl = URL(string: paymentIntentUrl)!

        var request = URLRequest(url: backendCheckoutUrl)
        request.httpMethod = "POST"
        let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, _, _) in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                  let customerId = json["customer"] as? String,
                  let customerEphemeralKeySecret = json["ephemeralKey"] as? String,
                  let paymentIntentClientSecret = json["paymentIntent"] as? String,
                  let self = self else {
                // Handle error
                self?.plugin?.notifyListeners(PaymentSheetEvents.FailedToLoad.rawValue, data: [:])
                call.reject("URLSession Error. Response data is invalid")
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

            let useApplePay = call.getBool("useApplePay") ?? false
            let applePayMerchantId = call.getString("applePayMerchantId") ?? ""
            let applePayMerchantCountryCode = call.getString("applePayMerchantCountryCode") ?? ""

            if useApplePay == true && applePayMerchantId != "" && applePayMerchantCountryCode != "" {
                configuration.applePay = .init(
                    merchantId: applePayMerchantId,
                    merchantCountryCode: applePayMerchantCountryCode
                )
            }

            configuration.customer = .init(id: customerId, ephemeralKeySecret: customerEphemeralKeySecret)
            self.paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration)

            self.plugin?.notifyListeners(PaymentSheetEvents.Loaded.rawValue, data: [:])
            call.resolve([:])
        })
        task.resume()
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
                        self.plugin?.notifyListeners(PaymentSheetEvents.Failed.rawValue, data: [:])
                        call.resolve(["paymentResult": PaymentSheetEvents.Failed.rawValue])
                    }
                }
            }
        }
    }
}
