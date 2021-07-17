import Foundation
import Capacitor
import Stripe
import FloatingPanel

class CardInputModalExecutor: NSObject, FloatingPanelControllerDelegate {
    public weak var plugin: CAPPlugin?
    var setupIntentClientSecret: String?
    public var floatingPanelController: FloatingPanelController!
    
    class ModalFloatingPanelLayout: FloatingPanelLayout {
        let position: FloatingPanelPosition = .bottom
        let initialState: FloatingPanelState = .half
        var anchors: [FloatingPanelState: FloatingPanelLayoutAnchoring] {
            return [
                .half: FloatingPanelLayoutAnchor(absoluteInset: 350.0, edge: .bottom, referenceGuide: .safeArea),
            ]
        }
    }
    
    func createSetupIntent(_ call: CAPPluginCall) {
        self.setupIntentClientSecret = call.getString("setupIntentClientSecret");
    }
    
    func presentSetupIntent(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                self.floatingPanelController = FloatingPanelController()
                self.floatingPanelController.layout = ModalFloatingPanelLayout()
                
                let appearance = SurfaceAppearance()
                appearance.cornerRadius = 8.0
                self.floatingPanelController.surfaceView.appearance = appearance
                
                // be able swipe close
                // floatingPanelController.isRemovalInteractionEnabled = true
                
                self.floatingPanelController.delegate = self
                
                let modalContentViewController = ModalContentViewController()
                modalContentViewController.delegate = self
                modalContentViewController.plugin = self.plugin
                modalContentViewController.setupIntentClientSecret = self.setupIntentClientSecret
                self.floatingPanelController.set(contentViewController: modalContentViewController)
                self.floatingPanelController.addPanel(toParent:  rootViewController, animated: true)
            }
        }
    }
}

extension CardInputModalExecutor: ModalContentViewControllerDelegate {
    func dismissModal() {
        NSLog("これ", "クリックされた")
        floatingPanelController.dismiss(animated: true, completion: nil)
    }
}

class ModalContentViewController: UIViewController {
    public weak var plugin: CAPPlugin?
    var delegate: ModalContentViewControllerDelegate?
    var setupIntentClientSecret: String?
    
    lazy var cardTextField: STPPaymentCardTextField = {
        let cardTextField = STPPaymentCardTextField()
        return cardTextField
    }()
    lazy var payButton: UIButton = {
        let button = UIButton(type: .custom)
        button.layer.cornerRadius = 5
        button.backgroundColor = .systemBlue
        button.titleLabel?.font = UIFont.systemFont(ofSize: 22)
        button.setTitle("Save", for: .normal)
        button.addTarget(self, action: #selector(pay), for: .touchUpInside)
        return button
    }()
    lazy var mandateLabel: UILabel = {
        let mandateLabel = UILabel()
        // Collect permission to reuse the customer's card:
        // In your app, add terms on how you plan to process payments and
        // reference the terms of the payment in the checkout flow
        // See https://stripe.com/docs/strong-customer-authentication/faqs#mandates
        mandateLabel.text = "I authorise Stripe Samples to send instructions to the financial institution that issued my card to take payments from my card account in accordance with the terms of my agreement with you."
        mandateLabel.numberOfLines = 0
        mandateLabel.font = UIFont.preferredFont(forTextStyle: .footnote)
        mandateLabel.textColor = .systemGray
        return mandateLabel
    }()
    lazy var closeButton: UIButton = {
        let btnClose = UIButton()
        btnClose.titleLabel?.textAlignment = .center
        btnClose.setTitle("✕", for: .normal)
        btnClose.setTitleColor(.white, for: .normal)
        btnClose.frame = CGRect(x: 10, y: 30, width: 30, height: 30)
        btnClose.layer.cornerRadius = btnClose.bounds.midY
        btnClose.backgroundColor = .black
        let closeGesture = UITapGestureRecognizer(target: self, action: #selector(self.closeGesture))
        btnClose.addGestureRecognizer(closeGesture)
        return btnClose
    }()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let stackView = UIStackView(arrangedSubviews: [cardTextField, payButton,  mandateLabel])
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.layoutMargins = UIEdgeInsets(top: 60, left: 0, bottom: 0, right: 0)
        stackView.isLayoutMarginsRelativeArrangement = true
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(stackView)
        view.addSubview(closeButton)

        NSLayoutConstraint.activate([
            stackView.leftAnchor.constraint(equalToSystemSpacingAfter: view.leftAnchor, multiplier: 2),
            view.rightAnchor.constraint(equalToSystemSpacingAfter: stackView.rightAnchor, multiplier: 2),
            stackView.topAnchor.constraint(equalToSystemSpacingBelow: view.topAnchor, multiplier: 2),
        ])
        
        self.view.backgroundColor = .black
    }
    
    @objc
    func pay() {
        guard let setupIntentClientSecret = setupIntentClientSecret else {
            return;
        }
        // Collect card details
        let cardParams = cardTextField.cardParams
        
        // Collect the customer's email to know which customer the PaymentMethod belongs to.
        let billingDetails = STPPaymentMethodBillingDetails()
        
        // Create SetupIntent confirm parameters with the above
        let paymentMethodParams = STPPaymentMethodParams(card: cardParams, billingDetails: billingDetails, metadata: nil)
        let setupIntentParams = STPSetupIntentConfirmParams(clientSecret: setupIntentClientSecret)
        setupIntentParams.paymentMethodParams = paymentMethodParams
        
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                let paymentHandler = STPPaymentHandler.shared()
                
                paymentHandler.confirmSetupIntent(setupIntentParams, with: rootViewController as! STPAuthenticationContext) { status, setupIntent, error in
                    switch (status) {
                    case .failed:
                        break
                    case .canceled:
                        break
                    case .succeeded:
                        break
                    @unknown default:
                        fatalError()
                        break
                    }
                }
            }
        }
    }
    
    @objc func closeGesture(sender:UITapGestureRecognizer) {
        delegate?.dismissModal()
    }
}

protocol ModalContentViewControllerDelegate {
    func dismissModal()
}
