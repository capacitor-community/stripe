import XCTest
import BillingSDK
@testable import StripeBillingPlugin

@MainActor
final class CustomerSessionRequestsTests: XCTestCase {
    private func session(_ customer: String) throws -> UBCustomerSessionDetails {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .secondsSince1970
        let data = try JSONSerialization.data(withJSONObject: [
            "customer": customer, "clientSecret": "test_session", "expiresAt": Date().timeIntervalSince1970 + 3600
        ])
        return try decoder.decode(UBCustomerSessionDetails.self, from: data)
    }

    func testResetReleasesPendingRequestAndRejectsLateResponse() async throws {
        let requests = CustomerSessionRequests()
        var requestId = ""
        let pending = Task {
            try await requests.request { id in
                requestId = id
                requests.cancel()
            }
        }
        do {
            _ = try await pending.value
            XCTFail("Reset must cancel pending authentication")
        } catch is CancellationError {} catch { XCTFail("Unexpected error: \(error)") }
        XCTAssertThrowsError(try requests.respond(id: requestId, session: session("cus_a"), failed: false))
    }

    func testBackendFailureDoesNotBecomeAnonymousCheckout() async {
        let requests = CustomerSessionRequests()
        do {
            _ = try await requests.request { id in
                try? requests.respond(id: id, session: nil, failed: true)
            }
            XCTFail("Backend failures must reject")
        } catch {
            XCTAssertNotNil(requests.failure)
        }
    }

    func testCustomerSwitchRequiresResetAndDuplicateResponseIsRejected() async throws {
        let requests = CustomerSessionRequests()
        let first = try session("cus_a")
        let other = try session("cus_b")
        var firstId = ""
        _ = try await requests.request { id in
            firstId = id
            try? requests.respond(id: id, session: first, failed: false)
        }
        XCTAssertThrowsError(try requests.respond(id: firstId, session: first, failed: false))
        let refreshed = try await requests.request { id in
            do {
                try requests.respond(id: id, session: other, failed: false)
                XCTFail("Changing customers without reset must reject")
            } catch {}
            // Invalid input leaves the request pending so the caller can correct it.
            try? requests.respond(id: id, session: first, failed: false)
        }
        XCTAssertEqual(refreshed?.customer, "cus_a")
    }
}
