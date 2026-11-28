import WebKit
import XCTest
@testable import StripePlugin

@MainActor
final class EmbeddedPaymentNavigationTests: XCTestCase, WKNavigationDelegate {
    private var loaded: XCTestExpectation?

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation?) {
        loaded?.fulfill()
        loaded = nil
    }

    func testReplacementDocumentCanMountWithoutPagehide() async throws {
        let webView = WKWebView()
        let plugin = StripePlugin()
        plugin.webView = webView
        webView.navigationDelegate = self

        func loadCheckout() async {
            let finished = expectation(description: "Main document loaded")
            loaded = finished
            webView.loadHTMLString("<html><body>Checkout</body></html>", baseURL: nil)
            await fulfillment(of: [finished], timeout: 15)
        }

        await loadCheckout()
        let first = try XCTUnwrap(plugin.beginEmbeddedPayment())
        _ = try await webView.callAsyncJavaScript("""
            await new Promise(resolve => {
                const frame = document.createElement('iframe');
                frame.onload = resolve;
                document.body.append(frame);
            });
            """, arguments: [:], in: nil, contentWorld: .page)
        XCTAssertNil(plugin.beginEmbeddedPayment(), "A subframe must preserve the active checkout")

        await loadCheckout()
        let second = try XCTUnwrap(plugin.beginEmbeddedPayment())
        XCTAssertTrue(first.documentReplaced)
        XCTAssertFalse(first === second)
        XCTAssertNil(plugin.beginEmbeddedPayment(), "Only one checkout can own the new document")
    }
}
