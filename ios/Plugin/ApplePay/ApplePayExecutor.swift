import Foundation
import Capacitor
import PassKit
import StripeApplePay

class ApplePayExecutor: NSObject, ApplePayContextDelegate {
    weak var plugin: StripePlugin?
    var appleClientSecret: String = ""
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
        let requiredShippingContactFields = call.getArray("requiredShippingContactFields", String.self) ?? [""]
        let paymentRequest = StripeAPI.paymentRequest(withMerchantIdentifier: merchantIdentifier, country: call.getString("countryCode", "US"), currency: call.getString("currency", "USD"))
        paymentRequest.paymentSummaryItems = paymentSummaryItems
        if requiredShippingContactFields.count > 0 {
            var contactFieldArray: [PKContactField] = []
            if requiredShippingContactFields.contains("postalAddress") {
                contactFieldArray.append(.postalAddress)
            }
            if requiredShippingContactFields.contains("phoneNumber") {
                contactFieldArray.append(.phoneNumber)
            }
            if requiredShippingContactFields.contains("emailAddress") {
                contactFieldArray.append(.emailAddress)
            }
            if requiredShippingContactFields.contains("name") {
                contactFieldArray.append(.name)
            }
            paymentRequest.requiredShippingContactFields = Set(contactFieldArray)
        }

        self.appleClientSecret = paymentIntentClientSecret!
        self.paymentRequest = paymentRequest

        self.plugin?.notifyListeners(ApplePayEvents.Loaded.rawValue, data: [:])
        call.resolve()
    }

    func presentApplePay(_ call: CAPPluginCall) {
        if let paymentRequest = self.paymentRequest {
            if let applePayContext = STPApplePayContext(paymentRequest: paymentRequest, delegate: self) {
                DispatchQueue.main.async {
                    if let rootViewController = self.plugin?.getRootVC() {
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
    func transformPKContactToJSON(contact: PKContact?) -> Any {
        var nameFormatted = ""
        if #available(iOS 15.0, *) {
            nameFormatted = (contact?.name?.nameSuffix as? String ?? "")
        }
        var dataString = "[{" +
        "\"givenName\":\"\(contact?.name?.givenName as? String ?? "")\"," +
        "\"familyName\":\"\(contact?.name?.familyName as? String ?? "")\"," +
        "\"middleName\":\"\(contact?.name?.middleName as? String ?? "")\"," +
        "\"namePrefix\":\"\(contact?.name?.namePrefix as? String ?? "")\"," +
        "\"nameSuffix\":\"\(contact?.name?.nameSuffix as? String ?? "")\"," +
        "\"nameFormatted\":\"\(nameFormatted)\"," +
        "\"phoneNumber\":\"\(contact?.phoneNumber?.stringValue as? String ?? "")\"," +
        "\"nickname\":\"\(contact?.name?.nickname as? String ?? "")\"," +
        "\"street\":\"\(contact?.postalAddress?.street as? String ?? "")\"," +
        "\"city\":\"\(contact?.postalAddress?.city as? String ?? "")\"," +
        "\"state\":\"\(contact?.postalAddress?.state as? String ?? "")\"," +
        "\"postalCode\":\"\(contact?.postalAddress?.postalCode as? String ?? "")\"," +
        "\"country\":\"\(contact?.postalAddress?.country as? String ?? "")\"," +
        "\"isoCountryCode\":\"\(contact?.postalAddress?.isoCountryCode as? String ?? "")\"," +
        "\"subAdministrativeArea\":\"\(contact?.postalAddress?.subAdministrativeArea as? String ?? "")\"," +
        "\"subLocality\":\"\(contact?.postalAddress?.subLocality as? String ?? "")\"" +
        "}]"
        dataString = dataString.replacingOccurrences(of: "\n", with: "\\n")
        let dataStringUTF8 = dataString.data(using: .utf8)!
        do {
            if let jsonArray = try JSONSerialization.jsonObject(with: dataStringUTF8, options: .allowFragments) as? [Dictionary<String, Any>] {
                return jsonArray
            }
        } catch let error as NSError {
            print(error)
            return {}
        }
        return {}
    }

    // For security reasons, Apple does not return the full address until a successful payment has been made.
    func applePayContext(_ context: STPApplePayContext, didSelectShippingContact contact: PKContact, handler: @escaping (PKPaymentRequestShippingContactUpdate) -> Void) {
        handler(PKPaymentRequestShippingContactUpdate.init(paymentSummaryItems: []))
        let jsonArray = self.transformPKContactToJSON(contact: contact)
        self.plugin?.notifyListeners(ApplePayEvents.DidSelectShippingContact.rawValue, data: ["contact": jsonArray])
    }

    func applePayContext(_ context: STPApplePayContext, didCreatePaymentMethod paymentMethod: StripeAPI.PaymentMethod, paymentInformation: PKPayment, completion: @escaping STPIntentClientSecretCompletionBlock) {
        let clientSecret = self.appleClientSecret
        let error = "" // Call the completion block with the client secret or an error
        completion(clientSecret, error as? Error)
        let jsonArray = self.transformPKContactToJSON(contact: paymentInformation.shippingContact)
        self.plugin?.notifyListeners(ApplePayEvents.DidCreatePaymentMethod.rawValue, data: ["contact": jsonArray])
    }

    func applePayContext(_ context: STPApplePayContext, didCompleteWith status: STPApplePayContext.PaymentStatus, error: Error?) {
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
