import XCTest
import Capacitor
import BillingSDK
@testable import StripeBillingPlugin

// Exercise the real SDK and Capacitor entry points without any Stripe network traffic.
private class OfflineEntitlementsProtocol: URLProtocol {
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        if request.url?.path == "/v1/customer_sessions/claim" {
            let data = Data("{\"api_key\":\"test_key\",\"api_key_expiry\":4102444800}".utf8)
            guard let url = request.url,
                  let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: nil, headerFields: nil) else {
                XCTFail("Invalid stub request")
                client?.urlProtocol(self, didFailWithError: URLError(.badURL))
                return
            }
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } else {
            client?.urlProtocol(self, didFailWithError: URLError(.cannotDecodeRawData))
        }
    }
    override func stopLoading() {}
}

@MainActor
final class CustomerCacheIsolationTests: XCTestCase {
    private final class AuthenticatedPlugin: StripeBillingPlugin {
        override func notifyListeners(_ eventName: String, data: [String: Any]?) {
            if eventName == "customerSessionRequested", let id = data?["requestId"] as? String {
                let options: JSObject = [
                    "requestId": id,
                    "session": ["customer": "cus_new", "clientSecret": "test_session", "expiresAt": 4102444800] as JSObject
                ]
                guard let call = CAPPluginCall(callbackId: id, methodName: "setCustomerSession", options: options,
                                              success: { _, _ in }, error: { XCTFail($0?.message ?? "Session rejected") }) else {
                    XCTFail("Unable to create session response")
                    return
                }
                setCustomerSession(call)
            }
            if eventName == "entitlementsChanged", let items = data?["entitlements"] as? [[String: Any]] {
                XCTAssertFalse(items.contains { $0["lookupKey"] as? String == "old_customer_premium" })
            }
        }
    }

    func testNewLoginCannotFallBackToPreviousCustomersCachedEntitlements() async {
        URLProtocol.registerClass(OfflineEntitlementsProtocol.self)
        let cache = UserDefaultsCache()
        defer {
            URLProtocol.unregisterClass(OfflineEntitlementsProtocol.self)
            cache.clear(forKey: LocalCacheKeys.entitlements)
        }
        cache.saveCodable([
            Entitlement(id: "ent_old", feature: "feat_old", lookupKey: "old_customer_premium")
        ], forKey: LocalCacheKeys.entitlements)
        let plugin = AuthenticatedPlugin()
        let initialized = await invoke(plugin.initialize, options: ["publishableKey": "pk_test_placeholder"])
        XCTAssertTrue(initialized)
        let fetched = await invoke(plugin.getActiveEntitlements, options: ["forceRefresh": true])
        XCTAssertFalse(fetched, "A failed refresh must reject, not return the previous customer's cached access")
        let reset = await invoke(plugin.reset)
        XCTAssertTrue(reset)
    }

    private func invoke(_ method: (CAPPluginCall) -> Void, options: JSObject = [:]) async -> Bool {
        await withCheckedContinuation { continuation in
            guard let call = CAPPluginCall(callbackId: UUID().uuidString, methodName: "test", options: options,
                                          success: { _, _ in continuation.resume(returning: true) },
                                          error: { _ in continuation.resume(returning: false) }) else {
                XCTFail("Unable to create plugin call")
                continuation.resume(returning: false)
                return
            }
            method(call)
        }
    }
}
