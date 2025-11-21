import Foundation
import Capacitor
import StripePaymentSheet

class PaymentFlowExecutor: NSObject {
    weak var plugin: StripePlugin?
    var paymentSheetFlowController: PaymentSheet.FlowController!

    func createPaymentFlow(_ call: CAPPluginCall) {
        let paymentIntentClientSecret = call.getString("paymentIntentClientSecret") ?? nil
        let setupIntentClientSecret = call.getString("setupIntentClientSecret") ?? nil

        let customerId = call.getString("customerId") ?? nil
        let customerEphemeralKeySecret = call.getString("customerEphemeralKeySecret") ?? nil

        if paymentIntentClientSecret == nil && setupIntentClientSecret == nil {
            let errorText = "Invalid Params. this method require paymentIntentClientSecret or setupIntentClientSecret."
            self.plugin?.notifyListeners(PaymentFlowEvents.FailedToLoad.rawValue, data: ["error": errorText])
            call.reject(errorText)
            return
        }

        if customerId != nil && customerEphemeralKeySecret == nil {
            let errorText = "Invalid Params. When you set customerId, you must set customerEphemeralKeySecret."
            self.plugin?.notifyListeners(PaymentFlowEvents.FailedToLoad.rawValue, data: ["error": errorText])
            call.reject(errorText)
            return
        }

        // MARK: Create a PaymentSheet instance
        var configuration = PaymentSheet.Configuration()

        let paymentMethodLayout = call.getString("paymentMethodLayout") ?? "automatic"
        if paymentMethodLayout == "horizontal" {
            configuration.paymentMethodLayout = .horizontal
        } else if paymentMethodLayout == "vertical" {
            configuration.paymentMethodLayout = .vertical
        } else {
            configuration.paymentMethodLayout = .automatic
        }

        let merchantDisplayName = call.getString("merchantDisplayName") ?? ""
        if merchantDisplayName != "" {
            configuration.merchantDisplayName = merchantDisplayName
        }

        let returnURL = call.getString("returnURL") ?? ""
        if returnURL != "" {
            configuration.returnURL = returnURL
        }

        let style = call.getString("style") ?? ""
        if style == "alwaysLight" {
            configuration.style = .alwaysLight
        } else if style == "alwaysDark" {
            configuration.style = .alwaysDark
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
                    if let val = value as? String {
                        configuration.defaultBillingDetails.email = val
                    }
                case "name":
                    if let val = value as? String {
                        configuration.defaultBillingDetails.name = val
                    }
                case "phone":
                    if let val = value as? String {
                        configuration.defaultBillingDetails.phone = val
                    }
                case "address":
                    if let val = value as? JSObject {
                        let address = PaymentSheet.Address(
                            city: val["city"] as? String,
                            country: val["country"] as? String,
                            line1: val["line1"] as? String,
                            line2: val["line2"] as? String,
                            postalCode: val["postalCode"] as? String,
                            state: val["state"] as? String
                        )
                        configuration.defaultBillingDetails.address = address
                    }
                default:
                    return
                }
            })
        }

        if setupIntentClientSecret != nil {
            PaymentSheet.FlowController.create(setupIntentClientSecret: setupIntentClientSecret!,
                                               configuration: configuration) { [weak self] result in
                switch result {
                case .failure(let error):
                    self?.plugin?.notifyListeners(PaymentFlowEvents.FailedToLoad.rawValue, data: ["error": error.localizedDescription as! String])
                    call.reject(error.localizedDescription)
                case .success(let paymentSheetFlowController):
                    self?.paymentSheetFlowController = paymentSheetFlowController
                    self?.plugin?.notifyListeners(PaymentFlowEvents.Loaded.rawValue, data: [:])
                    call.resolve([:])
                }
            }
        } else if paymentIntentClientSecret != nil {
            PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret!,
                                               configuration: configuration) { [weak self] result in
                switch result {
                case .failure(let error):
                    self?.plugin?.notifyListeners(PaymentFlowEvents.FailedToLoad.rawValue, data: ["error": error.localizedDescription])
                    call.reject(error.localizedDescription)
                case .success(let paymentSheetFlowController):
                    self?.paymentSheetFlowController = paymentSheetFlowController
                    self?.plugin?.notifyListeners(PaymentFlowEvents.Loaded.rawValue, data: [:])
                    call.resolve([:])
                }
            }
        }
    }

    func presentPaymentFlow(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = self.plugin?.getRootVC() {
                self.paymentSheetFlowController.presentPaymentOptions(from: rootViewController) {
                    self.plugin?.notifyListeners(PaymentFlowEvents.Opened.rawValue, data: [:])
                    self.updateFlow(call)
                }
            }
        }
    }

    private func updateFlow(_ call: CAPPluginCall) {
        if let paymentOption = paymentSheetFlowController.paymentOption {
            self.plugin?.notifyListeners(PaymentFlowEvents.Created.rawValue, data: [
                "cardNumber": paymentOption.label
            ])
            call.resolve([
                "cardNumber": paymentOption.label
            ])
        } else {
            self.plugin?.notifyListeners(PaymentFlowEvents.Canceled.rawValue, data: [:])
            call.reject("User close PaymentFlow Sheet")
        }
    }

    func confirmPaymentFlow(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = self.plugin?.getRootVC() {
                self.paymentSheetFlowController.confirm(from: rootViewController) { paymentResult in
                    switch paymentResult {
                    case .completed:
                        self.plugin?.notifyListeners(PaymentFlowEvents.Completed.rawValue, data: [:])
                        call.resolve(["paymentResult": PaymentFlowEvents.Completed.rawValue])
                    case .canceled:
                        self.plugin?.notifyListeners(PaymentFlowEvents.Canceled.rawValue, data: [:])
                        call.resolve(["paymentResult": PaymentFlowEvents.Canceled.rawValue])
                    case .failed(let error):
                        self.plugin?.notifyListeners(PaymentFlowEvents.Failed.rawValue, data: ["error": error.localizedDescription])
                        call.resolve(["paymentResult": PaymentFlowEvents.Failed.rawValue])
                    }
                }
            }
        }
    }
}
