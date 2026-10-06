import Foundation
import BillingSDK

// The SDK swallows provider errors as unauthenticated. Keep the failure so the
// bridge never treats a failed refresh as successful or anonymous checkout.
@MainActor
final class CustomerSessionRequests {
    private var pending: [String: CheckedContinuation<UBCustomerSessionDetails?, Error>] = [:]
    private var timers: [String: Task<Void, Never>] = [:]
    private var customer: String?
    private var stopped = false
    var failure: Error?

    func request(notify: (String) -> Void) async throws -> UBCustomerSessionDetails? {
        guard !stopped else { throw CancellationError() }
        let id = UUID().uuidString
        return try await withCheckedThrowingContinuation { continuation in
            pending[id] = continuation
            timers[id] = Task { [weak self] in
                do { try await Task.sleep(nanoseconds: 30_000_000_000) } catch { return }
                self?.finish(id, result: .failure(SessionError.timeout))
            }
            notify(id)
        }
    }

    func respond(id: String, session: UBCustomerSessionDetails?, failed: Bool) throws {
        guard pending[id] != nil else { throw SessionError.stale }
        if failed {
            finish(id, result: .failure(SessionError.backend))
            return
        }
        if let session {
            guard !session.customer.isEmpty, !session.clientSecret.isEmpty,
                  session.expiresAt > Date() else { throw SessionError.invalid }
            if let customer, customer != session.customer { throw SessionError.customerChanged }
            customer = session.customer
        } else if customer != nil {
            // An existing customer's cached entitlements must not survive sign-out.
            finish(id, result: .failure(SessionError.customerChanged))
            return
        }
        finish(id, result: .success(session))
    }

    func cancel() {
        stopped = true
        for id in Array(pending.keys) { finish(id, result: .failure(CancellationError())) }
    }

    private func finish(_ id: String, result: Result<UBCustomerSessionDetails?, Error>) {
        guard let continuation = pending.removeValue(forKey: id) else { return }
        timers.removeValue(forKey: id)?.cancel()
        if case .failure(let error) = result { failure = error }
        continuation.resume(with: result)
    }

    enum SessionError: LocalizedError {
        case stale, timeout, invalid, backend, customerChanged
        var errorDescription: String? {
            switch self {
            case .stale: return "Customer Session request is no longer pending."
            case .timeout: return "Customer Session request timed out."
            case .invalid: return "Customer Session must contain a customer, secret and future expiry."
            case .backend: return "Unable to obtain a Customer Session."
            case .customerChanged: return "Call reset and initialize before changing or signing out a customer."
            }
        }
    }
}
