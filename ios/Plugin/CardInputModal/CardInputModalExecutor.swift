import Foundation
import Capacitor
import Stripe
import FloatingPanel

class CardInputModalExecutor: NSObject, FloatingPanelControllerDelegate {
    public weak var plugin: CAPPlugin?
    public var floatingPanelController: FloatingPanelController!
    
    class ModalFloatingPanelLayout: FloatingPanelLayout {
        let position: FloatingPanelPosition = .bottom
        let initialState: FloatingPanelState = .half
        var anchors: [FloatingPanelState: FloatingPanelLayoutAnchoring] {
            return [
                .half: FloatingPanelLayoutAnchor(absoluteInset: 200.0, edge: .bottom, referenceGuide: .safeArea),
            ]
        }
    }

    func presentCardInputModal() {
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
                
                let contentVC = ModalContentViewController()
                contentVC.delegate = self
                self.floatingPanelController.set(contentViewController: contentVC)
                //
                self.floatingPanelController.addPanel(toParent:  rootViewController)
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
    var delegate: ModalContentViewControllerDelegate?

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let btnClose = UIButton()
        btnClose.titleLabel?.textAlignment = .center
        btnClose.setTitle("✕", for: .normal)
        btnClose.setTitleColor(.white, for: .normal)
        btnClose.frame = CGRect(x: 20, y: 30, width: 30, height: 30)
        btnClose.layer.cornerRadius = btnClose.bounds.midY
        btnClose.backgroundColor = .black
        
        self.view.addSubview(btnClose)
        
        let closeGesture = UITapGestureRecognizer(target: self, action: #selector(self.closeGesture))
        btnClose.addGestureRecognizer(closeGesture)
 
        self.view.backgroundColor = .black
    }
    
    @objc func closeGesture(sender:UITapGestureRecognizer) {
        delegate?.dismissModal()
    }
}

protocol ModalContentViewControllerDelegate {
    func dismissModal()
}
