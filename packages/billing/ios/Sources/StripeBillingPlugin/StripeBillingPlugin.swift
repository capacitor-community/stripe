import Capacitor
import BillingSDK
import SwiftUI
import SafariServices

@objc(StripeBillingPlugin)
public class StripeBillingPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StripeBillingPlugin"
    public let jsName = "StripeBilling"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setCustomerSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getBuyButton", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentBuyButton", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getActiveEntitlements", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "hasEntitlement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "presentCustomerPortal", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reset", returnType: CAPPluginReturnPromise)
    ]
    @MainActor private lazy var billing = BillingBridge(plugin: self)

    @objc func initialize(_ call: CAPPluginCall) { Task { @MainActor in billing.initialize(call) } }
    @objc func setCustomerSession(_ call: CAPPluginCall) { Task { @MainActor in billing.setCustomerSession(call) } }
    @objc func getBuyButton(_ call: CAPPluginCall) { Task { @MainActor in billing.getBuyButton(call) } }
    @objc func presentBuyButton(_ call: CAPPluginCall) { Task { @MainActor in billing.presentBuyButton(call) } }
    @objc func getActiveEntitlements(_ call: CAPPluginCall) { Task { @MainActor in billing.getActiveEntitlements(call) } }
    @objc func hasEntitlement(_ call: CAPPluginCall) { Task { @MainActor in billing.hasEntitlement(call) } }
    @objc func presentCustomerPortal(_ call: CAPPluginCall) { Task { @MainActor in billing.presentCustomerPortal(call) } }
    @objc func reset(_ call: CAPPluginCall) { Task { @MainActor in await billing.reset(call) } }
}

@MainActor
private final class BillingBridge: NSObject, SFSafariViewControllerDelegate, UIAdaptivePresentationControllerDelegate {
    private weak var plugin: StripeBillingPlugin?
    private var sdk: BillingSDK?
    private var sessions = CustomerSessionRequests()
    private var operation: Task<Void, Never>?
    private var resetting = false
    private weak var presented: UIViewController?

    init(plugin: StripeBillingPlugin) { self.plugin = plugin }

    func initialize(_ call: CAPPluginCall) {
        guard sdk == nil, !resetting else { call.reject("Call reset before initializing again."); return }
        guard let key = call.getString("publishableKey"), key.hasPrefix("pk_"),
              let duration = (call.options["maximumStaleEntitlementsDuration"] ?? 300) as? NSNumber,
              CFGetTypeID(duration) != CFBooleanGetTypeID(), duration.doubleValue.isFinite,
              duration.doubleValue >= 0 else { call.reject("Invalid Billing configuration."); return }
        // Clear before construction: upstream reset leaves already-loaded entitlements in memory.
        let cache = UserDefaultsCache()
        cache.clear(forKey: LocalCacheKeys.entitlements)
        cache.clear(forKey: LocalCacheKeys.buyButtons)
        let instance = BillingSDK(configuration: .init(
            publishableKey: key, maximumStaleEntitlementsDuration: duration.doubleValue))
        let requests = CustomerSessionRequests()
        sessions = requests
        instance.setCustomerSessionProvider { [weak self] in
            try await requests.request { id in
                self?.plugin?.notifyListeners("customerSessionRequested", data: ["requestId": id])
            }
        }
        instance.onEntitlementsChanged { [weak self, weak instance] entitlements in
            Task { @MainActor in
                guard let self, let instance, self.sdk === instance, self.sessions.failure == nil else { return }
                self.plugin?.notifyListeners("entitlementsChanged", data: ["entitlements": self.serialize(entitlements)])
            }
        }
        sdk = instance
        call.resolve()
    }

    func setCustomerSession(_ call: CAPPluginCall) {
        guard let id = call.getString("requestId") else { call.reject("requestId is required."); return }
        do {
            let failed = call.getBool("failed") ?? false
            var details: UBCustomerSessionDetails?
            if let session = call.getObject("session") {
                let data = try JSONSerialization.data(withJSONObject: session)
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .secondsSince1970
                details = try decoder.decode(UBCustomerSessionDetails.self, from: data)
            } else if !(call.options["session"] is NSNull) && !failed {
                call.reject("session must be an object or null.")
                return
            }
            try sessions.respond(id: id, session: details, failed: failed)
            call.resolve()
        } catch let error as CustomerSessionRequests.SessionError {
            call.reject(error.localizedDescription)
        } catch {
            call.reject("Invalid Customer Session response.")
        }
    }

    // Serialize upstream cache access, and wait for cancelled work before reset.
    private func perform(_ call: CAPPluginCall?, work: @escaping (BillingSDK) async throws -> JSObject) {
        guard let sdk, !resetting else { reject(call, "Billing is not initialized."); return }
        guard operation == nil else { reject(call, "Another Billing operation is in progress."); return }
        sessions.failure = nil
        operation = Task {
            defer { operation = nil }
            do {
                let result = try await work(sdk)
                try checkSession()
                call?.resolve(result)
            } catch {
                // Upstream can cache an empty entitlement result after swallowing a provider error.
                // Clear that result so the next operation retries authentication.
                if sessions.failure != nil { await sdk.reset() }
                // Upstream errors may include request details; never forward secrets into JS/logs.
                reject(call, resetting ? "Billing operation was reset." : "Billing operation failed. Check your session and Stripe configuration.")
            }
        }
    }

    private func checkSession() throws {
        try Task.checkCancellation()
        if let error = sessions.failure { throw error }
        if resetting { throw CancellationError() }
    }

    private func reject(_ call: CAPPluginCall?, _ message: String) {
        if let call { call.reject(message) } else { plugin?.notifyListeners("billingError", data: ["message": message]) }
    }

    func getBuyButton(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), !id.isEmpty else { call.reject("id is required."); return }
        perform(call) { sdk in
            let button = try await sdk.getBuyButton(id: id)
            var result: JSObject = ["id": button.id, "active": button.active,
                                    "amount": button.lineItemGroup.amount_total, "currency": button.lineItemGroup.currency]
            if let text = button.callToAction { result["callToAction"] = text }
            return result
        }
    }

    func presentBuyButton(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), !id.isEmpty else { call.reject("id is required."); return }
        perform(call) { [self] sdk in
            let button = try await sdk.getBuyButton(id: id)
            try checkSession()
            let presenter = try presenter()
            let controller = UIHostingController(rootView: NavigationView {
                button.view { [weak self] in self?.checkout(button, owner: sdk) }
                    .padding()
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("Done") { [weak self] in self?.presented?.dismiss(animated: true) }
                        }
                    }
            })
            presented = controller
            presenter.present(controller, animated: true)
            return [:]
        }
    }

    private func checkout(_ button: BuyButton, owner: BillingSDK) {
        // Use the SDK view's custom action so auth failures cannot become anonymous purchases.
        guard button.active, sdk === owner else { return }
        perform(nil) { [self] _ in
            let key = try await button.ephemeralKeyProvider?()
            try checkSession()
            guard var url = URLComponents(string: button.checkoutUrl), url.scheme == "https" else { throw URLError(.badURL) }
            if let key {
                var query = url.queryItems ?? []
                query.removeAll { $0.name == "__ephemeral_key" }
                query.append(URLQueryItem(name: "__ephemeral_key", value: key))
                url.queryItems = query
            }
            guard let target = url.url, await UIApplication.shared.open(target, options: [:]) else { throw URLError(.badURL) }
            return [:]
        }
    }

    func getActiveEntitlements(_ call: CAPPluginCall) {
        perform(call) { [self] sdk in
            let items = try await sdk.getActiveEntitlements(forceRefresh: call.getBool("forceRefresh") ?? false)
            return ["entitlements": serialize(items)]
        }
    }

    func hasEntitlement(_ call: CAPPluginCall) {
        guard let key = call.getString("lookupKey"), !key.isEmpty else { call.reject("lookupKey is required."); return }
        perform(call) { sdk in
            ["active": try await sdk.hasEntitlement(lookupKey: key, forceRefresh: call.getBool("forceRefresh") ?? false)]
        }
    }

    func presentCustomerPortal(_ call: CAPPluginCall) {
        perform(call) { [self] sdk in
            let portal = try await sdk.getCustomerPortal()
            try checkSession()
            guard let url = URL(string: portal.url), url.scheme == "https" else { throw URLError(.badURL) }
            if call.getBool("external") == true {
                guard await UIApplication.shared.open(url, options: [:]) else { throw URLError(.badURL) }
            } else {
                let presenter = try presenter()
                let controller = SFSafariViewController(url: url)
                controller.delegate = self
                presented = controller
                presenter.present(controller, animated: true)
                controller.presentationController?.delegate = self
            }
            return [:]
        }
    }

    nonisolated func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        Task { @MainActor [weak self] in
            controller.dismiss(animated: true)
            await self?.portalClosed(controller)
        }
    }

    nonisolated func presentationControllerDidDismiss(_ controller: UIPresentationController) {
        Task { @MainActor [weak self] in
            await self?.portalClosed(controller.presentedViewController)
        }
    }

    private func portalClosed(_ controller: UIViewController) async {
        guard presented === controller, let owner = sdk, !resetting else { return }
        presented = nil
        // Do not drop the refresh if another SDK call is finishing when the sheet closes.
        await operation?.value
        guard sdk === owner, !resetting else { return }
        perform(nil) { sdk in
            _ = try await sdk.getActiveEntitlements(forceRefresh: true)
            return [:]
        }
    }

    private func presenter() throws -> UIViewController {
        guard let controller = plugin?.bridge?.viewController,
              controller.viewIfLoaded?.window != nil, controller.presentedViewController == nil else {
            throw URLError(.cannotLoadFromNetwork)
        }
        return controller
    }

    func reset(_ call: CAPPluginCall) async {
        guard !resetting else { call.reject("Billing is already initializing or resetting."); return }
        resetting = true
        let old = sdk
        sdk = nil
        old?.removeAllEntitlementsChangedCallbacks()
        sessions.cancel()
        operation?.cancel()
        await operation?.value
        if let presented {
            await withCheckedContinuation { continuation in
                presented.dismiss(animated: false) { continuation.resume() }
            }
        }
        await old?.reset()
        presented = nil
        resetting = false
        plugin?.notifyListeners("entitlementsChanged", data: ["entitlements": []])
        call.resolve()
    }

    private func serialize(_ items: [Entitlement]) -> [JSObject] {
        items.map { ["id": $0.id, "feature": $0.feature, "lookupKey": $0.lookupKey] }
    }
}
