import Foundation
import Stripe

extension StripePlugin : STPAuthenticationContext {
    public func authenticationPresentingViewController() -> UIViewController {
        return self.bridge?.viewController as! UIViewController
    }
}
