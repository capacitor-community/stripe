import Foundation
import Stripe
import Capacitor

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
    case .typeCard:
        return "card"
    case .typeCardPresent:
        return "card_present"
    case .typeFPX:
        return "fpx"
    case .typeiDEAL:
        return "ideal"
    // TODO add more types
    default:
        return "unknown"
    }
}

internal func strToPmType(_ pmTypeStr: String?) -> STPPaymentMethodType {
    switch pmTypeStr {
    case "card":
        return .typeCard
    // TODO add more types
    default:
        return .typeUnknown
    }
}

internal func strToBrand(_ brand: String?) -> STPCardBrand {
    switch brand {
    case "AMERICAN_EXPRESS":
        return STPCardBrand.amex
    case "DISCOVER":
        return STPCardBrand.discover
    case "JCB":
        return STPCardBrand.JCB
    case "DINERS_CLUB":
        return STPCardBrand.dinersClub
    case "VISA":
        return STPCardBrand.visa
    case "MASTERCARD":
        return STPCardBrand.masterCard
    case "UNIONPAY":
        return STPCardBrand.unionPay
    default:
        return STPCardBrand.unknown
    }
}

internal func brandToStr(_ brand: STPCardBrand) -> String {
    switch brand {
    case STPCardBrand.amex:
        return "AMERICAN_EXPRESS"
    case STPCardBrand.discover:
        return "DISCOVER"
    case STPCardBrand.JCB:
        return "JCB"
    case STPCardBrand.dinersClub:
        return "DINERS_CLUB"
    case STPCardBrand.visa:
        return "VISA"
    case STPCardBrand.masterCard:
        return "MASTERCARD"
    case STPCardBrand.unionPay:
        return "UNIONPAY"
    default:
        return "UNKNOWN"
    }
}

internal func ensurePluginInitialized(_ call: CAPPluginCall) -> Bool {
    let key = Stripe.defaultPublishableKey()

    if key == nil || key == "" {
        call.error("you must call setPublishableKey to initialize the plugin before calling this method")
        return false
    }

    return true
}

internal func address(_ obj: [String: String]) -> STPPaymentMethodAddress {
    let a = STPPaymentMethodAddress()
    a.line1 = obj["address_line1"]
    a.line2 = obj["address_line2"]
    a.city = obj["address_city"]
    a.state = obj["address_state"]
    a.postalCode = obj["address_zip"]
    a.country = obj["country"]
    return a
}

internal func address(fromObj: [String: Any]) -> STPPaymentMethodAddress {
    return address(addressDict(fromObj: fromObj))
}

internal func addressDict(fromObj: [String: Any]) -> [String: String] {
    return [
        "address_line1": fromObj["address_line1"] as? String ?? "",
        "address_line2": fromObj["address_line2"] as? String ?? "",
        "address_city": fromObj["address_city"] as? String ?? "",
        "address_state": fromObj["address_state"] as? String ?? "",
        "address_zip": fromObj["address_zip"] as? String ?? "",
        "address_country": fromObj["address_country"] as? String ?? "",
    ]
}

internal func addressDict(fromCall: CAPPluginCall) -> [String: String] {
    return [
        "address_line1": fromCall.getString("address_line1") ?? "",
        "address_line2": fromCall.getString("address_line2") ?? "",
        "address_city": fromCall.getString("address_city") ?? "",
        "address_state": fromCall.getString("address_state") ?? "",
        "address_zip": fromCall.getString("address_zip") ?? "",
        "address_country": fromCall.getString("address_country") ?? "",
    ]
}

internal func cardParams(fromObj: [String: Any]) -> STPCardParams {
    let p = STPCardParams()

    p.number = fromObj["number"] as? String ?? ""
    p.cvc = fromObj["cvc"] as? String ?? ""

    if let exp_yearStr = fromObj["exp_year"] as? String {
        p.expYear = UInt(exp_yearStr) ?? 0
    } else if let exp_yearInt = fromObj["exp_year"] as? Int {
        p.expYear = UInt(exp_yearInt)
    }

    if let exp_monthStr = fromObj["exp_month"] as? String {
        p.expMonth = UInt(exp_monthStr) ?? 0
    } else if let exp_monthInt = fromObj["exp_month"] as? Int {
        p.expMonth = UInt(exp_monthInt)
    }

    if let n = fromObj["name"] as? String, n != "" {
        p.name = n
    }

    if let c = fromObj["currency"] as? String, c != "" {
        p.currency = c
    }

    return p
}

internal func cardParams(
        fromObj: [String: Any],
        withAddress: [String: String]) -> STPCardParams {
    let p = cardParams(fromObj: fromObj)
    let pmbd = STPPaymentMethodBillingDetails()
    pmbd.address = address(withAddress)
    p.address = STPAddress.init(paymentMethodBillingDetails: pmbd)
    return p
}

internal func cardParams(fromCall: CAPPluginCall) -> STPCardParams {
    var c = [
        "number": fromCall.getString("number"),
        "cvc": fromCall.getString("cvc"),
        "exp_month": fromCall.getString("exp_month"),
        "exp_year": fromCall.getString("exp_year"),
        "name": fromCall.getString("name"),
        "currency": fromCall.getString("currency")
    ]

    if c["exp_month"] == nil, fromCall.hasOption("exp_month"), let em = fromCall.getInt("exp_month") {
        c["exp_month"] = String(em)
    }

    if c["exp_year"] == nil, fromCall.hasOption("exp_year"), let em = fromCall.getInt("exp_year") {
        c["exp_year"] = String(em)
    }

    let a = addressDict(fromCall: fromCall)
    return cardParams(fromObj: c as [String: Any], withAddress: a)
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
