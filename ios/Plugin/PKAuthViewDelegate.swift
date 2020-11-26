import Foundation
import Stripe
import Capacitor
import PassKit


extension StripePlugin : PKPaymentAuthorizationViewControllerDelegate {
    public func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        controller.dismiss(animated: true, completion: nil)

        guard let ctx = self.applePayCtx else {
            return
        }

        if let c = self.bridge.getSavedCall(ctx.callbackId) {
            c.error("payment timeout or user cancelled")
        }

        self.clearApplePay()
    }

    @available(iOS 11.0, *)
    public func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController, didAuthorizePayment payment: PKPayment, handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        guard let ctx = self.applePayCtx, let callback = self.bridge.getSavedCall(ctx.callbackId) else {
            completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
            self.clearApplePay()
            return
        }

        switch ctx.mode {
        case .PaymentIntent:
            guard let clientSecret = ctx.clientSecret else {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                callback.error("unexpected error")
                self.clearApplePay()
                return
            }

            STPAPIClient.shared.createPaymentMethod(with: payment) { (pm, err) in
                guard let pm = pm else {
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    callback.error("unable to create payment method: " + err!.localizedDescription, err)
                    self.clearApplePay()
                    return
                }

                let pip: STPPaymentIntentParams = STPPaymentIntentParams.init(clientSecret: clientSecret)
                pip.paymentMethodId = pm.stripeId

                STPPaymentHandler.shared().confirmPayment(withParams: pip, authenticationContext: self, completion: { (status, pi, err) in
                    switch status {
                    case .failed:
                        if err != nil {
                            callback.error("payment failed: " + err!.localizedDescription, err)
                        } else {
                            callback.error("payment failed")
                        }
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()

                    case .canceled:
                        callback.error("user cancelled the transaction")
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()

                    case .succeeded:
                        completion(PKPaymentAuthorizationResult(status: .success, errors: nil))
                        callback.success([
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
                    callback.error("unable to create token: " + err!.localizedDescription, err)
                    self.clearApplePay()
                    return
                }

                callback.success(["token": t.tokenId])
                self.applePayCtx!.completion = completion
            }
        }
    }
}
