import Foundation
import Capacitor
import Stripe

class PaymentSheetExecutor: NSObject {
    public weak var plugin: CAPPlugin?
    var paymentSheet: PaymentSheet?
    
    func createPaymentSheet(_ call: CAPPluginCall) {
        let paymentIntentUrl = call.getString("paymentIntentUrl") ?? "";
        if (paymentIntentUrl == "") {
            return
        }
        
        let backendCheckoutUrl = URL(string: paymentIntentUrl)!
        
        var request = URLRequest(url: backendCheckoutUrl)
        request.httpMethod = "POST"
        let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
                  let customerId = json["customer"] as? String,
                  let customerEphemeralKeySecret = json["ephemeralKey"] as? String,
                  let paymentIntentClientSecret = json["paymentIntent"] as? String,
                  let self = self else {
                // Handle error
                call.reject("URLSession Error. Response data is invalid");
                return
            }
            
            NSLog("memo:通信成功")
            
            // MARK: Create a PaymentSheet instance
            var configuration = PaymentSheet.Configuration()
            configuration.merchantDisplayName = "Example, Inc."
            configuration.customer = .init(id: customerId, ephemeralKeySecret: customerEphemeralKeySecret)
            self.paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration)
            NSLog("memo:resolve")
            
            call.resolve([:]);
        })
        task.resume()
    }

    func presentPaymentSheet(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                self.paymentSheet?.present(from: rootViewController) { paymentResult in
                  // MARK: Handle the payment result
                    NSLog("memo:実施")
                  switch paymentResult {
                  case .completed:
                    print("Your order is confirmed")
                  case .canceled:
                    print("Canceled!")
                  case .failed(let error):
                    print("Payment failed: \n\(error)")
                  }
                }
            call.resolve([:])
            }
        }
    }
}
