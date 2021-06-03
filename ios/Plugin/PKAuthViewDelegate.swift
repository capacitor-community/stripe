import Foundation
import Stripe
import Capacitor
import PassKit

extension StripePlugin: PKPaymentAuthorizationViewControllerDelegate {
    public func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        controller.dismiss(animated: true, completion: nil)

        guard let ctx = self.applePayCtx else {
            return
        }

        if let c = self.bridge?.savedCall(withID: ctx.callbackId) {
            c.error("payment timeout or user cancelled")
        }

        self.clearApplePay()
    }

    @available(iOS 11.0, *)
    public func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController, didAuthorizePayment payment: PKPayment, handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        guard let ctx = self.applePayCtx, let callback = self.bridge?.savedCall(withID: ctx.callbackId) else {
            completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
            self.clearApplePay()
            return
        }

        switch ctx.mode {
        case .PaymentIntent:
            guard let clientSecret = ctx.clientSecret else {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                callback.reject("unexpected error")
                self.clearApplePay()
                return
            }

            STPAPIClient.shared.createPaymentMethod(with: payment) { (pm, err) in
                guard let pm = pm else {
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    callback.reject("unable to create payment method: " + err!.localizedDescription)
                    self.clearApplePay()
                    return
                }

                let pip: STPPaymentIntentParams = STPPaymentIntentParams.init(clientSecret: clientSecret)
                pip.paymentMethodId = pm.stripeId

                STPPaymentHandler.shared().confirmPayment(pip, with: self, completion: { (status, _, err) in
                    switch status {
                    case .failed:
                        if err != nil {
                            callback.reject("payment failed: " + err!.localizedDescription)
                        } else {
                            callback.reject("payment failed")
                        }
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()

                    case .canceled:
                        callback.reject("user cancelled the transaction")
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()

                    case .succeeded:
                        completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
                        callback.resolve([
                            "success": true
                        ])
                        self.clearApplePay()
                    }
                })
            }

        case .Token:
            STPAPIClient.shared.createToken(with: payment) { (t, err) in
                guard let t = t else {
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    callback.reject("unable to create token: " + err!.localizedDescription)
                    self.clearApplePay()
                    return
                }

                callback.resolve(["token": t.tokenId])
                self.applePayCtx!.completion = completion
            }
        }
    }
}
