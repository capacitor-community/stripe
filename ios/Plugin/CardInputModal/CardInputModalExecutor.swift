import Foundation
import Capacitor
import Stripe
import FloatingPanel

class CardInputModalExecutor: NSObject, FloatingPanelControllerDelegate {
    public weak var plugin: CAPPlugin?
    var setupIntentClientSecret: String?
    public var floatingPanelController: FloatingPanelController!
    public var isOpen: Bool = false
    
    class ModalFloatingPanelLayout: FloatingPanelLayout {
        let position: FloatingPanelPosition = .bottom
        let initialState: FloatingPanelState = .half
        var anchors: [FloatingPanelState: FloatingPanelLayoutAnchoring] {
            return [
                .full: FloatingPanelLayoutAnchor(absoluteInset: 0, edge: .top, referenceGuide: .safeArea),
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
                if (self.isOpen) {
                    return
                }
                
                self.floatingPanelController = FloatingPanelController()
                self.floatingPanelController.layout = ModalFloatingPanelLayout()
                
                let appearance = SurfaceAppearance()
                
                let shadow = SurfaceAppearance.Shadow()
                shadow.color = UIColor.black
                shadow.offset = CGSize(width: 0, height: 16)
                shadow.radius = 16
                shadow.spread = 8
                appearance.shadows = [shadow]
                
                appearance.cornerRadius = 8.0
                self.floatingPanelController.surfaceView.appearance = appearance
                

                self.floatingPanelController.surfaceView.grabberHandle.isHidden = true
                
                // disable method, but will be work
                self.floatingPanelController.panGestureRecognizer.isEnabled = false
                self.floatingPanelController.backdropView.dismissalTapGestureRecognizer.isEnabled = true
                
                self.floatingPanelController.delegate = self
                
                let modalContentViewController = ModalContentViewController()
                modalContentViewController.delegate = self
                modalContentViewController.plugin = self.plugin
                modalContentViewController.setupIntentClientSecret = self.setupIntentClientSecret
                self.floatingPanelController.set(contentViewController: modalContentViewController)
                self.floatingPanelController.addPanel(toParent:  rootViewController, animated: true)
                self.isOpen = true
            }
        }
    }
}

extension CardInputModalExecutor: ModalContentViewControllerDelegate {
    func dismissModal() {
        self.isOpen = false
        floatingPanelController.dismiss(animated: true, completion: nil)
    }
    func keyboardWillShow() {
        floatingPanelController.move(to: .full, animated: true)
    }
    func keyboardWillHide() {
        floatingPanelController.move(to: .half, animated: true)
    }
}

class ModalContentViewController: UIViewController, STPPaymentCardTextFieldDelegate {
    public weak var plugin: CAPPlugin?
    var delegate: ModalContentViewControllerDelegate?
    var setupIntentClientSecret: String?
    
    lazy var cardTextField: STPPaymentCardTextField = {
        let cardTextField = STPPaymentCardTextField()
        return cardTextField
    }()
    
    lazy var closeButton: UIButton = {
        let closeButton = UIButton()
        closeButton.titleLabel?.textAlignment = .center
        closeButton.setTitle("×", for: .normal)
        closeButton.titleLabel?.sizeToFit()
        closeButton.setTitleColor(CompatibleColor.secondaryLabel, for: .normal)
        closeButton.frame = CGRect(x: 20, y: 15, width: 20, height: 20)
        closeButton.layer.cornerRadius = closeButton.bounds.midY

        let closeGesture = UITapGestureRecognizer(target: self, action: #selector(self.closeGesture))
        closeButton.addGestureRecognizer(closeGesture)
        return closeButton
    }()
    
    lazy var payButton: UIButton = {
        let button = UIButton(type: .custom)
        button.layer.cornerRadius = 5
        button.backgroundColor = .systemBlue
        button.titleLabel?.font = UIFont.systemFont(ofSize: 16)
        button.setTitle("Add card", for: .normal)
        button.titleLabel?.alpha = 0.6
        button.contentEdgeInsets = UIEdgeInsets(top: 12, left: 0, bottom: 12, right: 0)
        button.addTarget(self, action: #selector(pay), for: .touchUpInside)
        button.isEnabled = false
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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.hideKeyboardWhenTappedAround()
        
        NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillShowNotification, object: nil, queue: nil) {_ in
            self.delegate?.keyboardWillShow()
        }
        NotificationCenter.default.addObserver(forName: UIResponder.keyboardWillHideNotification, object: nil, queue: nil) {_ in
            self.delegate?.keyboardWillHide()
        }
        
        cardTextField.delegate = self;
        
        let stackView = UIStackView(arrangedSubviews: [cardTextField, payButton,  mandateLabel])
        stackView.axis = .vertical
        stackView.spacing = 20
        stackView.layoutMargins = UIEdgeInsets(top: 40, left: 5, bottom: 0, right: 5)
        stackView.isLayoutMarginsRelativeArrangement = true
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(stackView)
        view.addSubview(closeButton)

        NSLayoutConstraint.activate([
            stackView.leftAnchor.constraint(equalToSystemSpacingAfter: view.leftAnchor, multiplier: 2),
            view.rightAnchor.constraint(equalToSystemSpacingAfter: stackView.rightAnchor, multiplier: 2),
            stackView.topAnchor.constraint(equalToSystemSpacingBelow: view.topAnchor, multiplier: 2),
        ])
        
        self.view.backgroundColor = CompatibleColor.secondarySystemGroupedBackground
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
    
    func paymentCardTextFieldDidChange(_ textField: STPPaymentCardTextField) {
        payButton.isEnabled = textField.isValid
        
        if (payButton.isEnabled) {
            payButton.titleLabel?.alpha = 1
        } else {
            payButton.titleLabel?.alpha = 0.6
        }
    }
}

protocol ModalContentViewControllerDelegate {
    func dismissModal()
    func keyboardWillShow()
    func keyboardWillHide()
}

extension UIViewController {
    func hideKeyboardWhenTappedAround() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(UIViewController.dismissKeyboard))
        tap.cancelsTouchesInView = false
        view.addGestureRecognizer(tap)
    }
    @objc func dismissKeyboard() {
        view.endEditing(true)
    }
}
