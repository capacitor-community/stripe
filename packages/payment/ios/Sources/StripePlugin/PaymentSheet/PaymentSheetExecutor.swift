import Foundation
import Capacitor
import StripePaymentSheet

class PaymentSheetExecutor: NSObject {
    weak var plugin: StripePlugin?
    var paymentSheet: PaymentSheet?

    func createPaymentSheet(_ call: CAPPluginCall) {
        let paymentIntentClientSecret = call.getString("paymentIntentClientSecret") ?? nil
        let setupIntentClientSecret = call.getString("setupIntentClientSecret") ?? nil

        let customerId = call.getString("customerId") ?? nil
        let customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret") ?? nil

        if paymentIntentClientSecret == nil && setupIntentClientSecret == nil {
            let errorText = "Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret."
            self.plugin?.notifyListeners(PaymentSheetEvents.FailedToLoad.rawValue, data: ["error": errorText])
            call.reject(errorText)
            return
        }

        if customerId != nil && customerEphemeralKeySecret == nil {
            let errorText = "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret."
            self.plugin?.notifyListeners(PaymentSheetEvents.FailedToLoad.rawValue, data: ["error": errorText])
            call.reject(errorText)
            return
        }

        // MARK: Create a PaymentSheet instance
        var configuration = PaymentSheet.Configuration()

        let merchantDisplayName = call.getString("merchantDisplayName") ?? ""
        if merchantDisplayName != "" {
            configuration.merchantDisplayName = merchantDisplayName
        }

        let returnURL = call.getString("returnURL") ?? ""
        if returnURL != "" {
            configuration.returnURL = returnURL
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

        let billingDetailsCollectionConfiguration = call.getObject("billingDetailsCollectionConfiguration") ?? nil
        if billingDetailsCollectionConfiguration != nil {
            billingDetailsCollectionConfiguration?.forEach({ (key: String, value: JSValue) in
                let val: String = value as? String ?? "automatic"
                switch key {
                case "email":
                    configuration.billingDetailsCollectionConfiguration.email = PaymentSheetHelper().getCollectionModeValue(mode: val)
                case "name":
                    configuration.billingDetailsCollectionConfiguration.name = PaymentSheetHelper().getCollectionModeValue(mode: val)
                case "phone":
                    configuration.billingDetailsCollectionConfiguration.phone = PaymentSheetHelper().getCollectionModeValue(mode: val)
                case "address":
                    configuration.billingDetailsCollectionConfiguration.address = PaymentSheetHelper().getAddressCollectionModeValue(mode: val)
                default:
                    return
                }
            })
        }
        
        let defaultBillingDetails = call.getObject("defaultBillingDetails") ?? nil
        if defaultBillingDetails != nil {
            defaultBillingDetails?.forEach({ (key: String, value: JSValue) in
                switch key {
                case "email":
                    configuration.defaultBillingDetails.email = value as? String
                case "name":
                    configuration.defaultBillingDetails.name = value as? String
                case "phone":
                    configuration.defaultBillingDetails.phone = value as? String
                case "address":
                    let val = value as? JSObject
                    let address = PaymentSheet.Address(
                        city: val?["city"] as? String,
                        country: val?["country"] as? String,
                        line1: val?["line1"] as? String,
                        line2: val?["line2"] as? String,
                        postalCode: val?["postalCode"] as? String,
                        state: val?["state"] as? String,
                    )
                    configuration.defaultBillingDetails.address = address
                default:
                    return
                }
            })
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
            if let rootViewController = self.plugin?.getRootVC() {
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
