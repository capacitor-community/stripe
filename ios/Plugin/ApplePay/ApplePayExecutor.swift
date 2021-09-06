import Foundation
import Capacitor
import PassKit
import Stripe

class ApplePayExecutor: NSObject, STPApplePayContextDelegate {
    public weak var plugin: CAPPlugin?
    public var appleClientSecret: String = ""
    private var payCallId: String?
    private var paymentRequest: PKPaymentRequest?

    func isApplePayAvailable(_ call: CAPPluginCall) {
        if !StripeAPI.deviceSupportsApplePay() {
            call.reject("Can not use on this Device.")
            return
        }
        call.resolve()
    }

    func createApplePay(_ call: CAPPluginCall) {
        let paymentIntentClientSecret = call.getString("paymentIntentClientSecret") ?? nil
        if paymentIntentClientSecret == nil {
            call.reject("Invalid Params. this method require paymentIntentClientSecret")
            return
        }

        let items = call.getArray("paymentSummaryItems", [String: Any].self) ?? nil
        if items == nil {
            call.reject("Invalid Params. this method require paymentSummaryItems")
            return
        }

        var paymentSummaryItems: [PKPaymentSummaryItem] = []
        if let strs = items {
            for item in strs {
                let label = item["label"] as? String ?? ""
                let amount = item["amount"] as? NSNumber
                let amountD: NSDecimalNumber

                amountD = NSDecimalNumber(decimal: amount!.decimalValue)

                if (item["label"] != nil) && (item["amount"] != nil) {
                    paymentSummaryItems.append(PKPaymentSummaryItem(label: label, amount: amountD))
                }
            }
        }

        let merchantIdentifier = call.getString("merchantIdentifier") ?? ""
        let paymentRequest = StripeAPI.paymentRequest(withMerchantIdentifier: merchantIdentifier, country: call.getString("countryCode", "US"), currency: call.getString("currency", "USD"))
        paymentRequest.paymentSummaryItems = paymentSummaryItems

        self.appleClientSecret = paymentIntentClientSecret!
        self.paymentRequest = paymentRequest

        self.plugin?.notifyListeners(ApplePayEvents.Loaded.rawValue, data: [:])
        call.resolve()
    }

    func presentApplePay(_ call: CAPPluginCall) {
        if let paymentRequest = self.paymentRequest {
            if let applePayContext = STPApplePayContext(paymentRequest: paymentRequest, delegate: self) {
                DispatchQueue.main.async {
                    if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                        self.plugin?.bridge?.saveCall(call)
                        self.payCallId = call.callbackId
                        applePayContext.presentApplePay(on: rootViewController)
                    }
                }
            } else {
                call.reject("STPApplePayContext is failed")
            }
        } else {
            call.reject("You should run createApplePay befor presentApplePay")
        }
    }
}

extension ApplePayExecutor {
    func applePayContext(_ context: STPApplePayContext, didCreatePaymentMethod paymentMethod: STPPaymentMethod, paymentInformation: PKPayment, completion: @escaping STPIntentClientSecretCompletionBlock) {
        let clientSecret = self.appleClientSecret
        let error = "" // Call the completion block with the client secret or an error
        completion(clientSecret, error as? Error)
    }

    func applePayContext(_ context: STPApplePayContext, didCompleteWith status: STPPaymentStatus, error: Error?) {
        if let callId = self.payCallId, let call = self.plugin?.bridge?.savedCall(withID: callId) {
            switch status {
            case .success:
                self.plugin?.notifyListeners(ApplePayEvents.Completed.rawValue, data: [:])
                call.resolve(["paymentResult": ApplePayEvents.Completed.rawValue])
                break
            case .error:
                self.plugin?.notifyListeners(ApplePayEvents.Failed.rawValue, data: ["error": error?.localizedDescription])
                call.resolve(["paymentResult": ApplePayEvents.Failed.rawValue])
                break
            case .userCancellation:
                self.plugin?.notifyListeners(ApplePayEvents.Canceled.rawValue, data: [:])
                call.resolve(["paymentResult": ApplePayEvents.Canceled.rawValue])
                break
            @unknown default:
                fatalError()
            }
        }
    }
}
