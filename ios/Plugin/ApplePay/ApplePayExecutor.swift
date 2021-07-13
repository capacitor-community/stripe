import Foundation
import Capacitor
import PassKit
import Stripe

class ApplePayExecutor: NSObject {
    public weak var plugin: CAPPlugin?
    internal var applePayCtx: ApplePayContext?

    func payWithApplePay(_ call: CAPPluginCall) {
        let paymentRequest: PKPaymentRequest!

        do {
            paymentRequest = try applePayOpts(call: call)
        } catch let err {
            call.reject("unable to parse apple pay options: " + err.localizedDescription)
            return
        }

        if let authCtrl = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
            authCtrl.delegate = plugin as? PKPaymentAuthorizationViewControllerDelegate
            call.save()

            self.applePayCtx = ApplePayContext(callbackId: call.callbackId, mode: .Token, completion: nil, clientSecret: nil)

            DispatchQueue.main.async {
                self.plugin?.bridge?.viewController?.present(authCtrl, animated: true, completion: nil)
            }
            return
        }

        call.reject("invalid payment request")
    }

    func cancelApplePay(_ call: CAPPluginCall) {
        guard let ctx = self.applePayCtx else {
            call.reject("there is no existing Apple Pay transaction to cancel")
            return
        }

        if let c = ctx.completion {
            c(PKPaymentAuthorizationResult(status: .failure, errors: nil))
        }

        if let oldCallback = self.plugin?.bridge!.savedCall(withID: ctx.callbackId) {
            self.plugin?.bridge!.releaseCall(oldCallback)
        }

        self.applePayCtx = nil
        call.resolve()
    }

    func finalizeApplePayTransaction(_ call: CAPPluginCall) {
        guard let ctx = self.applePayCtx else {
            call.reject("there is no existing Apple Pay transaction to finalize")
            return
        }

        let success = call.getBool("success") ?? false

        if let c = ctx.completion {
            let s: PKPaymentAuthorizationStatus = success ? .success : .failure
            c(PKPaymentAuthorizationResult(status: s, errors: nil))
            call.resolve()
        } else {
            call.reject("unable to complete the payment")
        }

        self.clearApplePay()
    }

    func isApplePayAvailable(_ call: CAPPluginCall) {
        call.resolve([
            "available": Stripe.deviceSupportsApplePay()
        ])
    }

    func clearApplePay() {
        guard let ctx = self.applePayCtx else {
            return
        }

        if let c = self.plugin?.bridge?.savedCall(withID: ctx.callbackId) {
            self.plugin?.bridge?.releaseCall(c)
        }

        self.applePayCtx = nil
    }

}

internal struct ApplePayContext {
    var callbackId: String
    var mode: ApplePayMode
    var completion: ((PKPaymentAuthorizationResult) -> Void)?
    var clientSecret: String?
}

internal enum ApplePayMode {
    case PaymentIntent
    case Token
}

internal enum StripePluginError : Error {
    case InvalidApplePayRequest(String)
}

internal func applePayOpts(obj: [String: Any]) throws -> PKPaymentRequest {
    let merchantId = obj["merchantId"] as? String ?? ""
    let country = obj["country"] as? String ?? ""
    let currency = obj["currency"] as? String ?? ""
    let items = obj["items"] as? [[String: Any]] ?? []

    if merchantId == "" {
        throw StripePluginError.InvalidApplePayRequest("you must provide a valid merchant identifier")
    }

    if country == "" {
        throw StripePluginError.InvalidApplePayRequest("you must provide a country")
    }

    if currency == "" {
        throw StripePluginError.InvalidApplePayRequest("you must provide a currency")
    }

    if items.count == 0 {
        throw StripePluginError.InvalidApplePayRequest("you must provide at least one item")
    }

    let paymentRequest = Stripe.paymentRequest(withMerchantIdentifier: merchantId, country: country, currency: currency)

    if ((obj["billingEmailAddress"] as? NSNumber) == 1) {
        paymentRequest.requiredBillingContactFields.insert(PKContactField.emailAddress)
    }

    if ((obj["billingName"] as? NSNumber) == 1) {
        paymentRequest.requiredBillingContactFields.insert(PKContactField.name)
    }

    if ((obj["billingPhoneNumber"] as? NSNumber) == 1) {
        paymentRequest.requiredBillingContactFields.insert(PKContactField.phoneNumber)
    }

    if ((obj["billingPhoneticName"] as? NSNumber) == 1) {
        paymentRequest.requiredBillingContactFields.insert(PKContactField.phoneticName)
    }

    if ((obj["billingPostalAddress"] as? NSNumber) == 1) {
        paymentRequest.requiredBillingContactFields.insert(PKContactField.postalAddress)
    }

    if ((obj["shippingEmailAddress"] as? NSNumber) == 1) {
        paymentRequest.requiredShippingContactFields.insert(PKContactField.emailAddress)
    }

    if ((obj["shippingName"] as? NSNumber) == 1) {
        paymentRequest.requiredShippingContactFields.insert(PKContactField.name)
    }

    if ((obj["shippingPhoneNumber"] as? NSNumber) == 1) {
        paymentRequest.requiredShippingContactFields.insert(PKContactField.phoneNumber)
    }
    
    if ((obj["shippingPhoneticName"] as? NSNumber) == 1) {
        paymentRequest.requiredShippingContactFields.insert(PKContactField.phoneticName)
    }

    if ((obj["shippingPostalAddress"] as? NSNumber) == 1) {
        paymentRequest.requiredShippingContactFields.insert(PKContactField.postalAddress)
    }

    paymentRequest.paymentSummaryItems = []

    for it in items {
        let label = it["label"] as? String ?? ""
        let amount = it["amount"] as? NSNumber
        let amountD: NSDecimalNumber;

        if amount == nil {
            if let a = it["amount"] as? String, let ad = Decimal(string: a) {
                amountD = NSDecimalNumber(decimal: ad)
            }

            throw StripePluginError.InvalidApplePayRequest("each item must have an amount greater than 0")
        } else {
            amountD = NSDecimalNumber(decimal: amount!.decimalValue)
        }

        paymentRequest.paymentSummaryItems.append(
                PKPaymentSummaryItem(label: label, amount: amountD)
        )
    }

    if Stripe.canSubmitPaymentRequest(paymentRequest) {
        return paymentRequest
    } else {
        throw StripePluginError.InvalidApplePayRequest("invalid request")
    }
}

internal func applePayOpts(call: CAPPluginCall) throws -> PKPaymentRequest {
    let obj = call.getObject("applePayOptions")

    if obj == nil {
        throw StripePluginError.InvalidApplePayRequest("you must provide applePayOptions")
    }

    return try applePayOpts(obj: obj!)
}
