import Foundation
import CoreFoundation
import Capacitor
import PassKit
import StripeApplePay

class ApplePayExecutor: NSObject, ApplePayContextDelegate {
    weak var plugin: StripePlugin?
    var appleClientSecret: String = ""
    private var payCallId: String?
    private var paymentRequest: PKPaymentRequest?
    private var allowedCountries: [String] = []
    private var allowedCountriesErrorDescription: String = ""
    private var pendingShippingHandler: ((PKPaymentRequestShippingContactUpdate) -> Void)?
    private var pendingShippingUpdateId: String?
    private var shippingHandlerWorkItem: DispatchWorkItem?

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
        self.allowedCountries = call.getArray("allowedCountries", String.self) ?? []
        self.allowedCountriesErrorDescription = call.getString("allowedCountriesErrorDescription") ?? "Country not allowed"

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
    func transformPKContactToJSON(contact: PKContact?) -> JSObject {
        guard let contact else {
            return [:]
        }
        
        
        let name = contact.name
        let address = contact.postalAddress
        
        var nameFormatted = ""
        if #available(iOS 15.0, *) {
            nameFormatted = (contact.name?.nameSuffix as? String ?? "")
        }
        
        return [
             "givenName": name?.givenName ?? "",
             "familyName": name?.familyName ?? "",
             "middleName": name?.middleName ?? "",
             "namePrefix": name?.namePrefix ?? "",
             "nameSuffix": name?.nameSuffix ?? "",
             "nameFormatted": nameFormatted,
             "nickname": name?.nickname ?? "",
             "phoneNumber": contact.phoneNumber?.stringValue ?? "",
             "emailAddress": contact.emailAddress ?? "",
             "street": address?.street ?? "",
             "city": address?.city ?? "",
             "state": address?.state ?? "",
             "postalCode": address?.postalCode ?? "",
             "country": address?.country ?? "",
             "isoCountryCode": address?.isoCountryCode ?? "",
             "subAdministrativeArea": address?.subAdministrativeArea ?? "",
             "subLocality": address?.subLocality ?? ""
         ]
    }

    // For security reasons, Apple does not return the full address until a successful payment has been made.
    func applePayContext(_ context: STPApplePayContext, didSelectShippingContact contact: PKContact, handler: @escaping (PKPaymentRequestShippingContactUpdate) -> Void) {
        // Complete the old selection before accepting or rejecting the next one.
        completeShippingUpdate()

        // Validate allowed countries first — respond immediately if invalid
        if !self.allowedCountries.isEmpty {
            let addressIsoCountry = (contact.postalAddress?.isoCountryCode ?? "").lowercased()
            if !self.allowedCountries.contains(addressIsoCountry) {
                handler(PKPaymentRequestShippingContactUpdate(
                    errors: [PKPaymentRequest.paymentShippingAddressInvalidError(withKey: CNPostalAddressISOCountryCodeKey, localizedDescription: self.allowedCountriesErrorDescription)],
                    paymentSummaryItems: self.paymentRequest?.paymentSummaryItems ?? [],
                    shippingMethods: self.paymentRequest?.shippingMethods ?? []))
                return
            }
        }

        // Store handler so JS can call updateApplePaySheet with updated items
        let updateId = UUID().uuidString
        pendingShippingUpdateId = updateId
        pendingShippingHandler = handler

        // Fallback to the latest accepted items if JS does not respond.
        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self,
                  self.pendingShippingUpdateId == updateId else { return }
            self.completeShippingUpdate()
        }
        shippingHandlerWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 25, execute: workItem)

        let jsonArray = self.transformPKContactToJSON(contact: contact)
        self.plugin?.notifyListeners(ApplePayEvents.DidSelectShippingContact.rawValue, data: ["contact": jsonArray, "updateId": updateId])
    }

    func updateApplePaySheet(_ call: CAPPluginCall) {
        guard let updateId = call.getString("updateId"), !updateId.isEmpty else {
            call.reject("Invalid Params. this method requires updateId")
            return
        }

        guard pendingShippingHandler != nil else {
            call.reject("No pending shipping update")
            return
        }
        guard pendingShippingUpdateId == updateId else {
            call.reject("Stale shipping update")
            return
        }

        // Validate the entire payload before consuming the pending callback.
        guard let rawItems = call.options["paymentSummaryItems"] as? [[String: Any]], !rawItems.isEmpty else {
            call.reject("Invalid Params. paymentSummaryItems must be a non-empty array of items")
            return
        }
        var updatedItems: [PKPaymentSummaryItem] = []
        for (index, item) in rawItems.enumerated() {
            guard let label = item["label"] as? String, !label.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
                  let amount = item["amount"] as? NSNumber,
                  CFGetTypeID(amount) != CFBooleanGetTypeID(), amount.doubleValue.isFinite else {
                call.reject(
                    "Invalid paymentSummaryItems[\(index)]: expected a non-empty label and finite numeric amount")
                return
            }
            let decimalAmount = NSDecimalNumber(decimal: amount.decimalValue)
            guard decimalAmount != .notANumber else {
                call.reject("Invalid Params. paymentSummaryItems[\(index)].amount is not a valid decimal")
                return
            }
            updatedItems.append(PKPaymentSummaryItem(label: label, amount: decimalAmount))
        }
        guard let total = updatedItems.last, total.amount.compare(NSDecimalNumber.zero) != .orderedAscending else {
            call.reject("Invalid Params. the final paymentSummaryItems amount must be greater than or equal to zero")
            return
        }
        self.paymentRequest?.paymentSummaryItems = updatedItems
        completeShippingUpdate()
        call.resolve()
    }

    private func completeShippingUpdate() {
        shippingHandlerWorkItem?.cancel()
        shippingHandlerWorkItem = nil
        let handler = pendingShippingHandler
        pendingShippingHandler = nil
        pendingShippingUpdateId = nil
        // Clear state before invoking the handler so it can only be consumed once.
        handler?(PKPaymentRequestShippingContactUpdate(
            errors: nil,
            paymentSummaryItems: paymentRequest?.paymentSummaryItems ?? [],
            shippingMethods: paymentRequest?.shippingMethods ?? []))
    }

    func applePayContext(_ context: STPApplePayContext, didCreatePaymentMethod paymentMethod: StripeAPI.PaymentMethod, paymentInformation: PKPayment) async throws -> String {
        return try await withCheckedThrowingContinuation { continuation in
            continuation.resume(with: .success(self.appleClientSecret))
            let jsonArray = self.transformPKContactToJSON(contact: paymentInformation.shippingContact)
            self.plugin?.notifyListeners(ApplePayEvents.DidCreatePaymentMethod.rawValue, data: ["contact": jsonArray])
        }
    }

    func applePayContext(_ context: STPApplePayContext, didCompleteWith status: STPApplePayContext.PaymentStatus, error: Error?) {
        completeShippingUpdate()

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
