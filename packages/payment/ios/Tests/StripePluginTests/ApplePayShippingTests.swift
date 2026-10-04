import XCTest
import Capacitor
import Contacts
import PassKit
import StripeApplePay
@testable import StripePlugin

@MainActor
final class ApplePayShippingTests: XCTestCase {
    private final class RecordingPlugin: StripePlugin {
        var shippingEvents: [[String: Any]] = []

        override func notifyListeners(_ eventName: String, data: [String: Any]?) {
            if eventName == ApplePayEvents.DidSelectShippingContact.rawValue {
                shippingEvents.append(data ?? [:])
            }
        }
    }

    private var executor: ApplePayExecutor!
    private var plugin: RecordingPlugin!
    private var context: STPApplePayContext!

    private func prepare(allowedCountries: [String] = []) {
        executor = ApplePayExecutor()
        plugin = RecordingPlugin()
        executor.plugin = plugin
        let options: JSObject = [
            "paymentIntentClientSecret": "pi_test_secret",
            "merchantIdentifier": "merchant.test",
            "allowedCountries": allowedCountries,
            "paymentSummaryItems": [["label": "Total", "amount": 10] as JSObject]
        ]
        let call = CAPPluginCall(callbackId: "create", methodName: "createApplePay", options: options,
                                 success: { _, _ in }, error: { XCTFail($0?.message ?? "Missing error") })!
        executor.createApplePay(call)
        let request = StripeAPI.paymentRequest(withMerchantIdentifier: "merchant.test", country: "US", currency: "USD")
        request.paymentSummaryItems = [PKPaymentSummaryItem(label: "Total", amount: 10)]
        context = STPApplePayContext(paymentRequest: request, delegate: executor)
        XCTAssertNotNil(context)
    }

    @discardableResult
    private func select(
        country: String = "us", handler: @escaping (PKPaymentRequestShippingContactUpdate) -> Void
    ) -> String {
        let address = CNMutablePostalAddress()
        address.isoCountryCode = country
        let contact = PKContact()
        contact.postalAddress = address
        executor.applePayContext(context, didSelectShippingContact: contact, handler: handler)
        return plugin.shippingEvents.last?["updateId"] as? String ?? ""
    }

    @discardableResult
    private func update(_ updateId: String, items: Any? = [["label": "Total", "amount": 12]]) -> String? {
        var options: [String: Any] = ["updateId": updateId]
        options["paymentSummaryItems"] = items
        var rejection: String?
        var completions = 0
        let call = CAPPluginCall(callbackId: "update", methodName: "updateApplePaySheet",
                                 options: JSTypes.coerceDictionaryToJSObject(options)!,
                                 success: { _, _ in completions += 1 }, error: {
            completions += 1
            rejection = $0?.message ?? "Missing error"
        })!
        executor.updateApplePaySheet(call)
        XCTAssertEqual(completions, 1, "Call must resolve or reject exactly once")
        return rejection
    }

    private func assertUpdate(_ update: PKPaymentRequestShippingContactUpdate, amount: Int = 10,
                              file: StaticString = #filePath, line: UInt = #line) {
        XCTAssertEqual(update.paymentSummaryItems.last?.amount, NSDecimalNumber(value: amount), file: file, line: line)
    }

    func testUpdatesPreserveItemsWhenEmptyAndRejectDuplicateCalls() {
        prepare()
        let updates: [(items: [[String: Any]], amount: Int)] = [
            ([], 10), ([["label": "Total", "amount": 12]], 12), ([], 12)
        ]
        for (items, amount) in updates {
            var calls = 0
            let id = select { update in
                calls += 1
                self.assertUpdate(update, amount: amount)
            }
            XCTAssertNil(update(id, items: items))
            XCTAssertEqual(update(id), "No pending shipping update")
            executor.applePayContext(context, didCompleteWith: .success, error: nil)
            XCTAssertEqual(calls, 1)
        }
    }

    func testTimeoutUsesLatestAcceptedItems() async {
        prepare()
        let first = select { self.assertUpdate($0, amount: 12) }
        XCTAssertNil(update(first))
        let timedOut = expectation(description: "Pending selection times out")
        var calls = 0
        let second = select {
            calls += 1
            self.assertUpdate($0, amount: 12)
            timedOut.fulfill()
        }
        await fulfillment(of: [timedOut], timeout: 30)
        XCTAssertEqual(update(second), "No pending shipping update")
        executor.applePayContext(context, didCompleteWith: .userCancellation, error: nil)
        XCTAssertEqual(calls, 1)
    }

    func testRepeatedSelectionCompletesPreviousHandlerAndRejectsStaleUpdate() {
        prepare()
        var firstCalls = 0
        var secondCalls = 0
        let first = select {
            firstCalls += 1
            self.assertUpdate($0)
        }
        let second = select {
            secondCalls += 1
            self.assertUpdate($0, amount: 12)
        }
        XCTAssertNotEqual(first, second)
        XCTAssertEqual(firstCalls, 1)
        XCTAssertEqual(secondCalls, 0)
        XCTAssertEqual(update(first), "Stale shipping update")
        XCTAssertNil(update(second))
        XCTAssertEqual(firstCalls, 1)
        XCTAssertEqual(secondCalls, 1)
    }

    func testDisallowedCountryResolvesBothHandlersWithoutEmittingAnotherEvent() {
        prepare(allowedCountries: ["us"])
        var calls = 0
        let id = select {
            calls += 1
            self.assertUpdate($0)
        }
        select(country: "jp") {
            calls += 1
            self.assertUpdate($0)
            XCTAssertEqual($0.errors?.count, 1)
        }
        XCTAssertEqual(calls, 2)
        XCTAssertEqual(plugin.shippingEvents.count, 1)
        XCTAssertEqual(update(id), "No pending shipping update")
    }

    func testMalformedItemsAreRejectedWithoutConsumingPendingHandler() {
        prepare()
        var calls = 0
        let id = select { _ in calls += 1 }
        let invalid: [Any?] = [
            nil, "invalid", ["invalid"], [["label": "Total"]], [["amount": 12]],
            [["label": " ", "amount": 12]], [["label": "Total", "amount": "12"]],
            [["label": "Total", "amount": true]], [["label": "Total", "amount": Double.nan]],
            [["label": "Total", "amount": Double.infinity]], [["label": "Total", "amount": -1]],
            [["label": "Total", "amount": 12], ["label": "Invalid"]]
        ]
        XCTAssertTrue(update("")?.contains("updateId") == true)
        for items in invalid {
            XCTAssertTrue(update(id, items: items)?.contains("paymentSummaryItems") == true)
            XCTAssertEqual(calls, 0)
        }
        // Negative discounts and a zero total are valid; only the final total must be nonnegative.
        XCTAssertNil(update(id, items: [
            ["label": "Subtotal", "amount": 10], ["label": "Discount", "amount": -10], ["label": "Total", "amount": 0]
        ]))
        XCTAssertEqual(calls, 1)
    }

    func testCompletionAndCancellationClearHandlers() {
        for status in [STPApplePayContext.PaymentStatus.success, .error, .userCancellation] {
            prepare()
            var calls = 0
            let id = select {
                calls += 1
                self.assertUpdate($0)
            }
            executor.applePayContext(context, didCompleteWith: status, error: nil)
            executor.applePayContext(context, didCompleteWith: status, error: nil)
            XCTAssertEqual(calls, 1)
            XCTAssertEqual(update(id), "No pending shipping update")
        }
    }
}
