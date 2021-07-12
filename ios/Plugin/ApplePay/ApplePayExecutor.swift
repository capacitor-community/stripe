import Foundation
import Capacitor

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
            authCtrl.delegate = self
            call.save()

            self.applePayCtx = ApplePayContext(callbackId: call.callbackId, mode: .Token, completion: nil, clientSecret: nil)

            DispatchQueue.main.async {
                self.bridge?.viewController?.present(authCtrl, animated: true, completion: nil)
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

        if let oldCallback = self.bridge!.savedCall(withID: ctx.callbackId) {
            self.bridge?.releaseCall(oldCallback)
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
    
    func clearApplePay(_ call: CAPPluginCall) {
        guard let ctx = self.applePayCtx else {
            return
        }

        if let c = self.bridge?.savedCall(withID: ctx.callbackId) {
            self.bridge?.releaseCall(c)
        }

        self.applePayCtx = nil
    }

}
