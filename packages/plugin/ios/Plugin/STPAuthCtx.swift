import Foundation
import Stripe

extension StripePlugin : STPAuthenticationContext {
    public func authenticationPresentingViewController() -> UIViewController {
        return self.bridge?.bridgeDelegate as! UIViewController
    }
}
