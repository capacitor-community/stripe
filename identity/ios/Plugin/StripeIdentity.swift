import Foundation

@objc public class StripeIdentity: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
