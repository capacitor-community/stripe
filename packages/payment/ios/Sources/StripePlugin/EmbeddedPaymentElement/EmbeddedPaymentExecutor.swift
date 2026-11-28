import Capacitor
import StripePaymentSheet
#if canImport(WebViewNativeUIEngine)
import WebViewNativeUIEngine
#endif

@MainActor
final class EmbeddedPaymentExecutor: EmbeddedPaymentElementDelegate {
    private weak var plugin: StripePlugin?
    private let clipView = PaymentElementContainer()
    private var element: EmbeddedPaymentElement?
    private var destroyed = false
    private(set) var documentReplaced = false
    private var confirming: CAPPluginCall?
    private var completed = false
    private var lastWidth: CGFloat?
    #if canImport(WebViewNativeUIEngine)
    private var projection: NativeUIProjection?
    #endif

    init(plugin: StripePlugin) {
        self.plugin = plugin
    }

    func mount(_ call: CAPPluginCall) async throws {
        #if canImport(WebViewNativeUIEngine)
        guard let webView = plugin?.bridge?.webView, let presenter = plugin?.bridge?.viewController,
              let name = plugin?.jsName, let selector = call.getString("selector"), !selector.isEmpty,
              let amount = call.getInt("amount"), amount > 0, let currency = call.getString("currency"),
              currency.range(of: #"^[A-Za-z]{3}$"#, options: .regularExpression) != nil,
              let secret = call.getString("paymentIntentClientSecret"), !secret.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        else { throw error("Provide a payment intent, amount, currency and a mounted DOM selector.") }

        var configuration = EmbeddedPaymentElement.Configuration()
        if let merchant = call.getString("merchantDisplayName"), !merchant.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            configuration.merchantDisplayName = merchant
        }
        configuration.returnURL = call.getString("returnURL")
        let intent = EmbeddedPaymentElement.IntentConfiguration(
            mode: .payment(amount: amount, currency: currency),
            confirmHandler: { _, _ in secret }
        )
        let element = try await EmbeddedPaymentElement.create(intentConfiguration: intent, configuration: configuration)
        guard !destroyed else { throw CancellationError() }
        self.element = element
        element.delegate = self
        element.presentingViewController = presenter
        let view = element.view
        clipView.visibleBounds = .zero
        clipView.addSubview(view)
        webView.addSubview(clipView)
        projection = try NativeUIProjection(
            webView: webView, plugin: name, projectionSelector: selector,
            receiveListeners: .init(update: [EmbeddedPaymentElementEvents.Change.rawValue]),
            failedFallback: .native,
            canCapture: { [weak presenter] in presenter?.presentedViewController == nil },
            view: { [weak clipView] in clipView }
        )
        publishChange()
        #else
        throw error("Enable the CapacitorCommunityStripe/Embedded CocoaPods subspec to use the payment element.")
        #endif
    }

    func update(_ call: CAPPluginCall) {
        guard let view = element?.view, let visible = call.getBool("visible"), visible,
              let left = call.getDouble("x"), let top = call.getDouble("y"),
              let width = call.getDouble("width"), let height = call.getDouble("height"),
              let clip = call.getObject("clip"),
              let clipLeft = clip["x"] as? Double, let clipTop = clip["y"] as? Double,
              let clipWidth = clip["width"] as? Double, let clipHeight = clip["height"] as? Double,
              width > 0, height > 0, clipWidth > 0, clipHeight > 0 else {
            clipView.frame = .zero
            return
        }
        clipView.frame = CGRect(x: left, y: top, width: width, height: height)
        clipView.visibleBounds = CGRect(x: clipLeft - left, y: clipTop - top, width: clipWidth, height: clipHeight)
        view.frame = clipView.bounds
        if width != lastWidth {
            lastWidth = width
            publishChange()
        }
    }

    func confirm(_ call: CAPPluginCall) async {
        guard let element, confirming == nil, !completed, element.paymentOption != nil else {
            return call.reject("Select a payment method before confirming an available payment.")
        }
        confirming = call
        publishChange()
        let result = await element.confirm()
        guard confirming === call else { return }
        confirming = nil
        let event: EmbeddedPaymentElementEvents
        var data: [String: Any] = [:]
        switch result {
        case .completed:
            completed = true
            event = .Completed
        case .canceled:
            event = .Canceled
        case .failed(let error):
            event = .Failed
            data["error"] = error.localizedDescription
        }
        plugin?.notifyListeners(event.rawValue, data: data)
        call.resolve(["paymentResult": event.rawValue])
        publishChange()
    }

    func destroy(documentReplaced: Bool = false) {
        destroyed = true
        self.documentReplaced = documentReplaced
        if !documentReplaced { confirming?.reject("Embedded payment element was removed.") }
        confirming = nil
        #if canImport(WebViewNativeUIEngine)
        projection?.destroy()
        projection = nil
        #endif
        element?.delegate = nil
        element?.view.removeFromSuperview()
        clipView.removeFromSuperview()
        element = nil
    }

    func embeddedPaymentElementDidUpdateHeight(embeddedPaymentElement: EmbeddedPaymentElement) {
        publishChange()
    }

    func embeddedPaymentElementDidUpdatePaymentOption(embeddedPaymentElement: EmbeddedPaymentElement) {
        publishChange()
    }

    private func publishChange() {
        guard let element else { return }
        var data: [String: Any] = ["ready": element.paymentOption != nil && confirming == nil && !completed]
        if let width = lastWidth {
            data["height"] = ceil(element.view.systemLayoutSizeFitting(
                CGSize(width: width, height: UIView.layoutFittingCompressedSize.height),
                withHorizontalFittingPriority: .required, verticalFittingPriority: .fittingSizeLevel
            ).height)
        }
        let event = EmbeddedPaymentElementEvents.Change.rawValue
        #if canImport(WebViewNativeUIEngine)
        projection?.receive(event, data: data)
        #endif
        plugin?.notifyListeners(event, data: data)
    }

    private func error(_ message: String) -> NSError {
        NSError(domain: "StripePlugin.EmbeddedPaymentElement", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
    }
}

// The same viewport intersection clips the SDK's pixels and its touch target.
// The Engine recognizes the renderer-owned mask and leaves scroll placement to the renderer.
private final class PaymentElementContainer: UIView {
    private let clipMask = CAShapeLayer()
    var visibleBounds: CGRect = .zero {
        didSet {
            clipMask.frame = bounds
            clipMask.path = UIBezierPath(rect: visibleBounds).cgPath
            layer.mask = clipMask
        }
    }

    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        visibleBounds.contains(point) && super.point(inside: point, with: event)
    }
}
