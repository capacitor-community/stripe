import Foundation
import Capacitor
import StripePaymentSheet
import StripeApplePay

@objc(StripePlugin)
public class StripePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StripePlugin"
    public let jsName = "Stripe"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "handleURLCallback", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createPaymentSheet", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentPaymentSheet", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createPaymentFlow", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentPaymentFlow", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "confirmPaymentFlow", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isApplePayAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createApplePay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentApplePay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isGooglePayAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "createGooglePay", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentGooglePay", returnType: CAPPluginReturnPromise)
    ]
    private let paymentSheetExecutor = PaymentSheetExecutor()
    private let paymentFlowExecutor = PaymentFlowExecutor()
    private let applePayExecutor = ApplePayExecutor()

    @objc func initialize(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.paymentFlowExecutor.plugin = self
        self.applePayExecutor.plugin = self

        let publishableKey = call.getString("publishableKey") ?? ""

        if publishableKey == "" {
            call.reject("you must provide publishableKey")
            return
        }

        StripeAPI.defaultPublishableKey = publishableKey

        let stripeAccount = call.getString("stripeAccount") ?? ""

        if stripeAccount != "" {
            STPAPIClient.shared.stripeAccount = stripeAccount
        }

        STPAPIClient.shared.appInfo = STPAppInfo(name: "@capacitor-community/stripe", partnerId: nil, version: nil, url: nil)

        call.resolve()
    }

    @objc func handleURLCallback(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.plugin = self
        self.paymentFlowExecutor.plugin = self
        self.applePayExecutor.plugin = self

        let urlString = call.getString("url") ?? ""

        if urlString == "" {
            call.reject("you must provide url returned from browser")
            return
        }

        let url = URL(string: urlString)!
        DispatchQueue.main.async {
            let stripeHandled = StripeAPI.handleURLCallback(with: url)
            if !stripeHandled {
                call.reject("This was not a Stripe url – handle the URL normally as you would")
                return
            }
            call.resolve()
        }

    }

    @objc func createPaymentSheet(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.createPaymentSheet(call)
    }

    @objc func presentPaymentSheet(_ call: CAPPluginCall) {
        self.paymentSheetExecutor.presentPaymentSheet(call)
    }

    @objc func createPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.createPaymentFlow(call)
    }

    @objc func presentPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.presentPaymentFlow(call)
    }

    @objc func confirmPaymentFlow(_ call: CAPPluginCall) {
        self.paymentFlowExecutor.confirmPaymentFlow(call)
    }

    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        self.applePayExecutor.isApplePayAvailable(call)
    }

    @objc func createApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.createApplePay(call)
    }

    @objc func presentApplePay(_ call: CAPPluginCall) {
        self.applePayExecutor.presentApplePay(call)
    }

    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }

    @objc func createGooglePay(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }

    @objc func presentGooglePay(_ call: CAPPluginCall) {
        call.unavailable("Not implemented on iOS.")
    }

    func getRootVC() -> UIViewController? {
        var window: UIWindow? = UIApplication.shared.delegate?.window ?? nil

        if window == nil {
            let scene: UIWindowScene? = UIApplication.shared.connectedScenes.first as? UIWindowScene
            window = scene?.windows.filter({$0.isKeyWindow}).first
            if window == nil {
                window = scene?.windows.first
            }
        }
        return window?.rootViewController
    }
}
