import Foundation
import Stripe
import Capacitor
import PassKit



internal enum StripePluginError : Error {
    case InvalidApplePayRequest(String)
}

internal enum ApplePayMode {
    case PaymentIntent
    case Token
}

internal struct ApplePayContext {
    var callbackId: String
    var mode: ApplePayMode
    var completion: ((PKPaymentAuthorizationResult) -> Void)?
    var clientSecret: String?
}

internal func pmTypeToStr(_ pmType: STPPaymentMethodType?) -> String {
    switch pmType {
    case .card:
        return "card"
    case .cardPresent:
        return "card_present"
    case .FPX:
        return "fpx"
    case .iDEAL:
        return "ideal"
    // TODO add more types
    default:
        return "unknown"
    }
}

internal func strToBrand(_ brand: String?) -> STPCardBrand {
    switch brand {
    case "American Express":
        return STPCardBrand.amex
    case "Diners Club":
        return STPCardBrand.dinersClub
    case "Discover":
        return STPCardBrand.discover
    case "JCB":
        return STPCardBrand.JCB
    case "MasterCard":
        return STPCardBrand.mastercard
    case "UnionPay":
        return STPCardBrand.unionPay
    case "Visa":
        return STPCardBrand.visa
    default:
        return STPCardBrand.unknown
    }
}

internal func ensurePluginInitialized(_ call: CAPPluginCall) -> Bool {
    let key = StripeAPI.defaultPublishableKey

    if key == nil || key == "" {
        call.error("you must call setPublishableKey to initialize the plugin before calling this method")
        return false
    }

    return true
}

// address(fromCall:) returns an STPAddress given a call containing address params. If no params are set, returns nil.
internal func address(fromCall: CAPPluginCall) -> STPAddress? {
    let a = STPAddress()
    a.line1 = fromCall.getString("address_line1")
    a.line2 = fromCall.getString("address_line2")
    a.city = fromCall.getString("address_city")
    a.state = fromCall.getString("address_state")
    a.postalCode = fromCall.getString("address_zip")
    a.country = fromCall.getString("country")
    if a.line1 != nil || a.line2 != nil || a.city != nil || a.state != nil || a.postalCode != nil || a.country != nil {
        return a
    }
    return nil
}

// address(fromObj:) returns an STPAddress given an object containing address params. If no params are set, returns nil.
internal func address(fromObj: [String: Any]) -> STPAddress? {
    let a = STPAddress()
    a.line1 = fromObj["address_line1"] as? String
    a.line2 = fromObj["address_line2"] as? String
    a.city = fromObj["address_city"] as? String
    a.state = fromObj["address_state"] as? String
    a.postalCode = fromObj["address_zip"] as? String
    a.country = fromObj["country"] as? String
    if a.line1 != nil || a.line2 != nil || a.city != nil || a.state != nil || a.postalCode != nil || a.country != nil {
        return a
    }
    return nil
}

// cardParams(fromCall:) returns an STPCardParams given a call containing card params. If address params are present an address will be added to the card. If no card params are set, returns nil.
internal func cardParams(fromCall: CAPPluginCall) -> STPCardParams {
    let p = STPCardParams()

    p.number = fromCall.getString("number")
    p.cvc = fromCall.getString("cvc")

    p.expYear = fromCall.getInt("exp_year").map { UInt($0) } ?? fromCall.getString("exp_year").flatMap { UInt($0) } ?? 0
    p.expMonth = fromCall.getInt("exp_month").map { UInt($0) } ?? fromCall.getString("exp_month").flatMap { UInt($0) } ?? 0

    p.name = fromCall.getString("name")
    p.currency = fromCall.getString("currency")

    if let a = address(fromCall: fromCall) {
        p.address = a
    }

    return p
}

// cardParams(fromObj:) returns an STPCardParams given an object containing card params. If address params are present an address will be added to the card. If no card params are set, returns nil.
internal func cardParams(fromObj: [String: Any]) -> STPCardParams? {
    let p = STPCardParams()

    p.number = fromObj["number"] as? String
    p.cvc = fromObj["cvc"] as? String

    p.expYear = fromObj["exp_year"] as? UInt ?? (fromObj["exp_year"] as? String).flatMap { UInt($0) } ?? 0
    p.expMonth = fromObj["exp_month"] as? UInt ?? (fromObj["exp_month"] as? String).flatMap { UInt($0) } ?? 0

    p.name = fromObj["name"] as? String
    p.currency = fromObj["currency"] as? String

    if let a = address(fromObj: fromObj) {
        p.address = a
    }

    return p
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

    let paymentRequest = StripeAPI.paymentRequest(withMerchantIdentifier: merchantId, country: country, currency: currency)

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

    if StripeAPI.canSubmitPaymentRequest(paymentRequest) {
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

internal func pmCardToJSON(c: STPPaymentMethodCard) -> [String: Any] {
    var cval: [String: Any] = [
        "brand": STPCardBrandUtilities.stringFrom(c.brand) ?? "unknown",
        "exp_month": c.expMonth,
        "exp_year": c.expYear,
    ]

    if let c = c.country {
        cval["country"] = c
    }

    if let f = c.funding {
        cval["funding"] = f
    }

    if let l = c.last4 {
        cval["last4"] = l
    }

    if let t = c.threeDSecureUsage {
        cval["three_d_secure_usage"] = [
            "supported": t.supported
        ]
    }

    return cval
}

internal func pmToJSON(m: STPPaymentMethod) -> [String: Any] {
    var val: [String: Any] = [
        "id": m.stripeId,
        "livemode": m.liveMode,
        "type": pmTypeToStr(m.type),
    ]

    if let cid = m.customerId {
        val["customerId"] = cid
    }

    if let c = m.created {
        val["created"] = c.timeIntervalSince1970
    }

    if let c = m.card {
        val["card"] = pmCardToJSON(c: c)
    }

    return val
}

internal func makeBankAccountParams(call: [AnyHashable: Any]!) -> STPBankAccountParams {
    let params = STPBankAccountParams()

    params.accountNumber = call["account_number"] as? String ?? ""
    params.country = call["country"] as? String ?? ""
    params.currency = call["currency"] as? String ?? ""
    params.routingNumber = call["routing_number"] as? String ?? ""
    params.accountHolderName = call["account_holder_name"] as? String ?? ""

    let accountHolderType = call["account_holder_type"] as? String ?? ""

    if accountHolderType == "individual" {
        params.accountHolderType = STPBankAccountHolderType.individual
    } else if accountHolderType == "company" {
        params.accountHolderType = STPBankAccountHolderType.company
    }

    return params
}
