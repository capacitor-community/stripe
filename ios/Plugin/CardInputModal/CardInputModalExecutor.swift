import Foundation
import Capacitor
import Stripe
import FloatingPanel

class CardInputModalExecutor: NSObject {
    public weak var plugin: CAPPlugin?
    
    class ContentViewController: UIViewController {
        override func viewDidLoad() {
            super.viewDidLoad()
     
            self.view.backgroundColor = .black
        }
    }
    
    func presentCardInputModal() {
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                
                var floatingPanelController: FloatingPanelController!
                floatingPanelController = FloatingPanelController()
                
                let contentVC = ContentViewController()
                floatingPanelController.set(contentViewController: contentVC)
                //
                floatingPanelController.addPanel(toParent:  rootViewController)
            }
        }
    }
}
