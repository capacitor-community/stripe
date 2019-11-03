import Foundation
import Stripe

extension StripePlugin: PKPaymentAuthorizationControllerDelegate {
    public func paymentAuthorizationControllerDidFinish(_ controller: PKPaymentAuthorizationController) {
        controller.dismiss(completion: nil)
    }
    
    @available(iOS 11.0, *)
    @objc private func paymentAuthorizationViewController(
        _ ctrl: PKPaymentAuthorizationControllerDelegate,
        didAuthPayment payment: PKPayment,
        handler: @escaping (PKPaymentAuthorizationResult) -> Void
        )
    {
        STPAPIClient.shared()
            .createToken(with: payment) { (token, err) in
                let cb = self.bridge.getSavedCall(self.applePayCallbackId!)
                
                if cb == nil {
                    return
                }
                
                guard let token = token else {
                    cb!.error("unable to complete Apple Pay transaction: " + err!.localizedDescription, err)
                    return
                }
                
                cb!.success([ "token": token.tokenId ])
                self.bridge.releaseCall(cb!)
        }
    }
}
