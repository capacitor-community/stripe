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
        paymentRequest.requiredShippingContactFields = Set([.postalAddress])

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
    func applePayContext(_ context: STPApplePayContext, didSelectShippingContact contact: PKContact, handler: @escaping (PKPaymentRequestShippingContactUpdate) -> Void) {
        handler(PKPaymentRequestShippingContactUpdate.init(paymentSummaryItems: []))
        if let callId = self.payCallId, let call = self.plugin?.bridge?.savedCall(withID: callId) {
            let postalCode = contact.postalAddress?.postalCode as? String ?? ""
            let country = contact.postalAddress?.country as? String ?? ""
            let dataString = "[{" +
            "\"postalCode\":\"\(postalCode)\"," +
            "\"country\":\"\(country)\"" +
            "}]"
            let dataStringUTF8 = dataString.data(using: .utf8)!
            do {
                if let jsonArray = try JSONSerialization.jsonObject(with: dataStringUTF8, options : .allowFragments) as? [Dictionary<String,Any>] {
                    call.resolve(["contact": jsonArray, , "didSelectShippingContact": true])
                }
            } catch let error as NSError {
                print(error)
            }
        }
    }

    func applePayContext(_ context: STPApplePayContext, didCreatePaymentMethod paymentMethod: STPPaymentMethod, paymentInformation: PKPayment, completion: @escaping STPIntentClientSecretCompletionBlock) {
        let clientSecret = self.appleClientSecret
        let error = "" // Call the completion block with the client secret or an error
        completion(clientSecret, error as? Error)
        if let callId = self.payCallId, let call = self.plugin?.bridge?.savedCall(withID: callId) {
            let street = paymentInformation.shippingContact?.postalAddress?.street as? String ?? ""
            let city = paymentInformation.shippingContact?.postalAddress?.city as? String ?? ""
            let state = paymentInformation.shippingContact?.postalAddress?.state as? String ?? ""
            let postalCode = paymentInformation.shippingContact?.postalAddress?.postalCode as? String ?? ""
            let country = paymentInformation.shippingContact?.postalAddress?.country as? String ?? ""
            let isoCountryCode = paymentInformation.shippingContact?.postalAddress?.isoCountryCode as? String ?? ""
            let subAdministrativeArea = paymentInformation.shippingContact?.postalAddress?.subAdministrativeArea as? String ?? ""
            let subLocality = paymentInformation.shippingContact?.postalAddress?.subLocality as? String ?? ""
            let dataString = "[{" +
            "\"street\":\"\(street)\"," +
            "\"city\":\"\(city)\"," +
            "\"state\":\"\(state)\"," +
            "\"postalCode\":\"\(postalCode)\"," +
            "\"country\":\"\(country)\"," +
            "\"isoCountryCode\":\"\(isoCountryCode)\"," +
            "\"subAdministrativeArea\":\"\(subAdministrativeArea)\"," +
            "\"subLocality\":\"\(subLocality)\"" +
            "}]"
            let dataStringUTF8 = dataString.data(using: .utf8)!
            do {
                if let jsonArray = try JSONSerialization.jsonObject(with: dataStringUTF8, options : .allowFragments) as? [Dictionary<String,Any>] {
                    call.resolve(["contact": jsonArray, "didCreatePaymentMethod": true])
                }
            } catch let error as NSError {
                print(error)
            }
        }
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
