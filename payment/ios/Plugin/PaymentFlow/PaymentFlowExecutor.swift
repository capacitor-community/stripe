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

        if setupIntentClientSecret != nil {
            PaymentSheet.FlowController.create(setupIntentClientSecret: setupIntentClientSecret!,
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
