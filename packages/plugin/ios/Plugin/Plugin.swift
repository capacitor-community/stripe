import Foundation
import Capacitor
import Stripe

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    var applePayCtx: ApplePayContext?
    
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.success([
            "value": value
        ])
    }

    @objc func setPublishableKey(_ call: CAPPluginCall) {
        let value = call.getString("key") ?? ""
        
        if value == "" {
          call.error("you must provide a valid key")
          return
        }
        
        Stripe.setDefaultPublishableKey(value)
        
        call.success()
    }
    
    @objc func validateCardNumber(_ call: CAPPluginCall) {
        call.success([
            "valid": STPCardValidator.validationState(
                forNumber: call.getString("number"),
                validatingCardBrand: false
            ) == STPCardValidationState.valid
        ])
    }
    
    @objc func validateExpiryDate(_ call: CAPPluginCall) {
        call.success([
            "valid": STPCardValidator.validationState(
              forExpirationYear: call.getString("expYear") ?? "",
              inMonth: call.getString("expMonth") ?? ""
            ) == STPCardValidationState.valid
        ])
    }
    
    @objc func validateCVC(_ call: CAPPluginCall) {
        call.success([
            "valid": STPCardValidator.validationState(
                forCVC: (call.getString("cvc")) ?? "",
                cardBrand: strToBrand(call.getString("brand"))
            ) == STPCardValidationState.valid
        ])
    }
    
    @objc private func strToBrand(_ brand: String?) -> STPCardBrand {
        switch brand {
        case "AMERICAN_EXPRESS":
            return STPCardBrand.amex
        case "DISCOVER":
            return STPCardBrand.discover
        case "JCB":
            return STPCardBrand.JCB
        case "DINERS_CLUB":
            return STPCardBrand.dinersClub
        case "VISA":
            return STPCardBrand.visa
        case "MASTERCARD":
            return STPCardBrand.masterCard
        case "UNIONPAY":
            return STPCardBrand.unionPay
        default:
            return STPCardBrand.unknown
        }
    }
    
    @objc private func brandToStr(_ brand: STPCardBrand) -> String {
        switch brand {
        case STPCardBrand.amex:
            return "AMERICAN_EXPRESS"
        case STPCardBrand.discover:
            return "DISCOVER"
        case STPCardBrand.JCB:
            return "JCB"
        case STPCardBrand.dinersClub:
            return "DINERS_CLUB"
        case STPCardBrand.visa:
            return "VISA"
        case STPCardBrand.masterCard:
            return "MASTERCARD"
        case STPCardBrand.unionPay:
            return "UNIONPAY"
        default:
            return "UNKNOWN"
        }
    }
    
    @objc func identifyCardBrand(_ call: CAPPluginCall) {
        call.success([
            "brand": brandToStr(
                STPCardValidator.brand(forNumber: call.getString("number") ?? "")
            )
        ])
    }
    
    @objc func createCardToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        let params = cardParams(fromCall: call)
        
        STPAPIClient.shared().createToken(withCard: params) { (token, error) in
            guard let token = token else {
                call.error("unable to create token: " + error!.localizedDescription, error)
                return
            }
            call.resolve(token.allResponseFields as! PluginResultData)
        }
    }
    
    @objc func createBankAccountToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        let params = STPBankAccountParams()
        params.accountNumber = call.getString("account_number")
        params.country = call.getString("country")
        params.currency = call.getString("currency")
        params.routingNumber = call.getString("routing_number")
        
        STPAPIClient.shared().createToken(withBankAccount: params) { (token, error) in
            guard let  token = token else {
                call.error("unable to create bank account token: " + error!.localizedDescription, error)
                return
            }
            
            call.resolve(token.allResponseFields as! PluginResultData)
        }
    }
    
    @objc func payWithApplePay(_ call: CAPPluginCall) {
        do {
            let paymentRequest = try applePayOpts(call: call)
            
            if let authCtrl = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
                authCtrl.delegate = self
                call.save()
                self.applePayCtx = ApplePayContext(callbackId: call.callbackId, mode: .Token, completion: nil, clientSecret: nil)
                
                DispatchQueue.main.async {
                    self.bridge.viewController.present(authCtrl, animated: true, completion: nil)
                }
                return
            }
            
            call.error("invalid payment request")
        } catch let err {
            call.error("unable to parse apple pay options: " + err.localizedDescription, err)
        }
    }
    
    @objc func cancelApplePay(_ call: CAPPluginCall) {
        guard let ctx = self.applePayCtx else {
            call.error("there is no existing Apple Pay transaction to cancel")
            return
        }
        
        if let c = ctx.completion {
            c(PKPaymentAuthorizationResult(status: .failure, errors: nil))
        }
        
        if let oldCallback = self.bridge.getSavedCall(ctx.callbackId) {
            self.bridge.releaseCall(oldCallback)
        }
        
        self.applePayCtx = nil
        call.success()
    }
    
    @objc func finalizeApplePayTransaction(_ call: CAPPluginCall) {
        guard let ctx = self.applePayCtx else {
            call.error("there is no existing Apple Pay transaction to finalize")
            return
        }
        
        let success = call.getBool("success") ?? false
        
        if let c = ctx.completion {
            let s: PKPaymentAuthorizationStatus
            
            if success {
                s = .success
            } else {
                s = .failure
            }
            
            c(PKPaymentAuthorizationResult(status: s, errors: nil))
        }
        
        self.clearApplePay()
        call.success()
    }
    
    @objc func createSourceToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        call.error("not implemented")
        // TODO implement
        /*
        let type = call.getInt("sourceType")
        
        if type == nil {
            call.error("you must provide a source type")
            return
        }
        
        let sourceType = STPSourceType.init(rawValue: type!)
        
        if sourceType == nil {
            call.error("invalid source type")
            return
        }
        
        let params: STPSourceParams
        
        switch sourceType!
        {
        case .threeDSecure:
            UInt(bitPattern: <#T##Int#>)
            let amount = UInt.init(: call.getInt("amount", 0)) ?? 0
            params = STPSourceParams.threeDSecureParams(
                withAmount: amount,
                currency: call.getString("currency"),
                returnURL: call.getString("returnURL"),
                card: call.getString("card"))
        case .bancontact:
            <#code#>
        case .card:
            <#code#>
        case .giropay:
            <#code#>
        case .IDEAL:
            <#code#>
        case .sepaDebit:
            <#code#>
        case .sofort:
            <#code#>
        case .alipay:
            <#code#>
        case .P24:
            <#code#>
        case .EPS:
            <#code#>
        case .multibanco:
            <#code#>
        case .weChatPay:
            <#code#>
        case .unknown:
            <#code#>
        }
       */
    }
    
    @objc func createPiiToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        let pii = call.getString("pii") ?? ""
        STPAPIClient.shared().createToken(withPersonalIDNumber: pii) { (token, error) in
            guard let token = token else {
                call.error("unable to create token: " + error!.localizedDescription, error)
                return
            }
            
            call.resolve([
                "token": token.tokenId
            ])
        }
    }
    
    @objc func createAccountToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        call.error("not implemented")
        
        // TODO implement
    }
    
    @objc func confirmPaymentIntent(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        let clientSecret = call.getString("clientSecret")
        
        if clientSecret == nil || clientSecret == "" {
            call.error("you must provide a client secret")
            return
        }
        
        if call.hasOption("applePayOpts") {
            do {
                let paymentRequest = try applePayOpts(call: call)
                
                if let authCtrl = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
                    authCtrl.delegate = self
                    call.save()
                    self.applePayCtx = ApplePayContext(callbackId: call.callbackId, mode: .PaymentIntent, completion: nil, clientSecret: clientSecret)
                    
                    DispatchQueue.main.async {
                        self.bridge.viewController.present(authCtrl, animated: true, completion: nil)
                    }
                    return
                }
                
                call.error("invalid payment request")
            } catch let err {
                call.error("unable to parse apple pay options: " + err.localizedDescription, err)
            }
            return
        }
    
        let saveMethod = call.getBool("saveMethod") ?? false
        //let redirectUrl = call.getString("redirectUrl") ?? ""
        let pip: STPPaymentIntentParams = STPPaymentIntentParams.init(clientSecret: clientSecret!)
        
        pip.savePaymentMethod = saveMethod ? 1 : 0
        //pip.returnURL = redirectUrl
        
        if call.hasOption("card") {
            let bd = STPPaymentMethodBillingDetails()
            bd.address = address(addressDict(fromCall: call))
            
            let cObj = call.getObject("card") ?? [:]
            let cpp = cardParams(fromObj: cObj)
            cpp.address = STPAddress.init(paymentMethodBillingDetails: bd)
            let pmp = STPPaymentMethodParams.init(card: STPPaymentMethodCardParams.init(cardSourceParams: cpp), billingDetails: bd, metadata: nil)
            pip.paymentMethodParams = pmp
            
        } else if call.hasOption("paymentMethodId") {
            pip.paymentMethodId = call.getString("paymentMethodId")
        } else if call.hasOption("sourceId") {
            pip.sourceId = call.getString("sourceId")
        }
    
        let pm = STPPaymentHandler.shared()
       
        pm.confirmPayment(withParams: pip, authenticationContext: self) { (status, pi, err) in
            switch status {
            case .failed:
                if err != nil {
                    call.error("payment failed: " + err!.localizedDescription, err)
                } else {
                    call.error("payment failed")
                }
                
            case .canceled:
                call.error("user cancelled the transaction")
                
            case .succeeded:
                call.success()
            }
        }
    }
    
    @objc func confirmSetupIntent(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
        let clientSecret = call.getString("clientSecret")
        
        if clientSecret == nil || clientSecret == "" {
            call.error("you must provide a client secret")
            return
        }
        
        //let redirectUrl = call.getString("redirectUrl") ?? ""
        let pip: STPSetupIntentConfirmParams = STPSetupIntentConfirmParams.init(clientSecret: clientSecret!)
        
        //pip.returnURL = redirectUrl
        
        if call.hasOption("card") {
            let bd = STPPaymentMethodBillingDetails()
            bd.address = address(addressDict(fromCall: call))
            
            let cObj = call.getObject("card") ?? [:]
            let cpp = cardParams(fromObj: cObj)
            cpp.address = STPAddress.init(paymentMethodBillingDetails: bd)
            let pmp = STPPaymentMethodParams.init(card: STPPaymentMethodCardParams.init(cardSourceParams: cpp), billingDetails: bd, metadata: nil)
            pip.paymentMethodParams = pmp
            
        } else if call.hasOption("paymentMethodId") {
            pip.paymentMethodID = call.getString("paymentMethodId")
        }
        
        let pm = STPPaymentHandler.shared()
        
        pm.confirmSetupIntent(withParams: pip, authenticationContext: self) { (status, si, err) in
            switch status {
            case .failed:
                if err != nil {
                    call.error("payment failed: " + err!.localizedDescription, err)
                } else {
                    call.error("payment failed")
                }
                
            case .canceled:
                call.error("user cancelled the transaction")
                
            case .succeeded:
                call.success()
            }
        }
    }
    
    @objc func customizePaymentAuthUI(_ call: CAPPluginCall) {
        call.error("not implemented")
        // TODO implement
    }
    
    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        call.success([
            "available": Stripe.deviceSupportsApplePay()
        ])
    }
    
    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.success(["available": false])
    }
    
    @objc func startGooglePayTransaction(_ call: CAPPluginCall) {
        call.error("Google Pay is not available")
    }
    
    @objc private func ensurePluginInitialized(_ call: CAPPluginCall) -> Bool {
        let key = Stripe.defaultPublishableKey()
        
        if key == nil || key == "" {
            call.error("you must call setPublishableKey to initialize the plugin before calling this method")
            return false
        }
        
        return true
    }
    
    @objc private func address(_ obj: [ String : String ]) -> STPPaymentMethodAddress {
        let a = STPPaymentMethodAddress()
        a.line1 = obj["address_line1"]
        a.line2 = obj["address_line2"]
        a.city = obj["address_city"]
        a.state = obj["address_state"]
        a.postalCode = obj["postalCode"]
        a.country = obj["country"]
        return a
    }
    
    @objc private func address(fromObj: [ String : Any ]) -> STPPaymentMethodAddress {
        return address(addressDict(fromObj: fromObj))
    }
    
    @objc private func addressDict(fromObj: [ String : Any ]) -> [ String : String ] {
        return [
            "address_line1": fromObj["address_line1"] as? String ?? "",
            "address_line2": fromObj["address_line2"] as? String ?? "",
            "address_city": fromObj["address_city"] as? String ?? "",
            "address_state": fromObj["address_state"] as? String ?? "",
            "postalCode": fromObj["postalCode"] as? String ?? "",
            "address_country": fromObj["address_country"] as? String ?? "",
        ]
    }
    
    @objc private func addressDict(fromCall: CAPPluginCall) -> [String : String] {
        return [
            "address_line1": fromCall.getString("address_line1") ?? "",
            "address_line2": fromCall.getString("address_line2") ?? "",
            "address_city": fromCall.getString("address_city") ?? "",
            "address_state": fromCall.getString("address_state") ?? "",
            "postalCode": fromCall.getString("postalCode") ?? "",
            "address_country": fromCall.getString("address_country") ?? "",
        ]
    }
    
    @objc private func cardParams(fromObj: [ String : Any ]) -> STPCardParams {
        let p = STPCardParams()
        
        p.number = fromObj["number"] as? String ?? ""
        p.cvc = fromObj["cvc"] as? String ?? ""
        
        if let expYearStr = fromObj["expYear"] as? String {
            p.expYear = UInt(expYearStr) ?? 0
        } else if let expYearInt = fromObj["expYear"] as? Int {
            p.expYear = UInt(expYearInt)
        }
        
        if let expMonthStr = fromObj["expMonth"] as? String {
            p.expMonth = UInt(expMonthStr) ?? 0
        } else if let expMonthInt = fromObj["expMonth"] as? Int {
            p.expMonth = UInt(expMonthInt)
        }
        
        if let n = fromObj["name"] as? String, n != "" {
            p.name = n
        }
        
        if let c = fromObj["currency"] as? String, c != "" {
            p.currency = c
        }
        
        return p
    }
    
    @objc private func cardParams(
        fromObj: [ String : Any ],
        withAddress: [ String : String ]) -> STPCardParams {
        let p = cardParams(fromObj: fromObj)
        let pmbd = STPPaymentMethodBillingDetails()
        pmbd.address = address(withAddress)
        p.address = STPAddress.init(paymentMethodBillingDetails: pmbd)
        return p
    }
    
    @objc private func cardParams(fromCall: CAPPluginCall) -> STPCardParams {
        var c = [
            "number": fromCall.getString("number"),
            "cvc": fromCall.getString("cvc"),
            "expMonth": fromCall.getString("expMonth"),
            "expYear": fromCall.getString("expYear"),
            "name": fromCall.getString("name"),
            "currency": fromCall.getString("currency")
        ]
        
        if c["expMonth"] == nil, fromCall.hasOption("expMonth"), let em = fromCall.getInt("expMonth") {
            c["expMonth"] = String(em)
        }
        
        if c["expYear"] == nil, fromCall.hasOption("expYear"), let em = fromCall.getInt("expYear") {
            c["expYear"] = String(em)
        }
        
        let a = addressDict(fromCall: fromCall)
        return cardParams(fromObj: c as [String : Any], withAddress: a)
    }
    
    @objc private func clearApplePay() {
        guard let ctx = self.applePayCtx else {
            return
        }
        
        if let c = self.bridge.getSavedCall(ctx.callbackId) {
            self.bridge.releaseCall(c)
        }
        
        self.applePayCtx = nil
    }
    
    private func applePayOpts(obj: [ String : Any ]) throws -> PKPaymentRequest {
        let merchantId = obj["merchantIdentifier"] as? String ?? ""
        let country = obj["country"] as? String ?? ""
        let currency = obj["currency"] as? String ?? ""
        let items = obj["items"] as? [[String:Any]] ?? []
        
        if merchantId == "" {
            throw StripePluginError.InvalidApplePayRequest("you must provide a valid merchant identifier")
        }
        
        if country == "" {
            throw StripePluginError.InvalidApplePayRequest("you must provide a country")
        }
        
        if currency == "" {
            throw StripePluginError.InvalidApplePayRequest("you must provide a currency")
        }
        
        if items.count == 0 {
            throw StripePluginError.InvalidApplePayRequest("you must provide at least one item")
        }
        
        let paymentRequest = Stripe.paymentRequest(withMerchantIdentifier: merchantId, country: country, currency: currency)
        
        paymentRequest.paymentSummaryItems = []
        
        for it in items {
            let label = it["label"] as? String ?? ""
            let amount = it["amount"] as? NSNumber
            let amountD: NSDecimalNumber;
            
            if amount == nil {
                if let a = it["amount"] as? String, let ad = Decimal(string: a) {
                    amountD = NSDecimalNumber(decimal: ad)
                }
                
                throw StripePluginError.InvalidApplePayRequest("each item must have an amount greater than 0")
            } else {
                amountD = NSDecimalNumber(decimal: amount!.decimalValue)
            }
            
            paymentRequest.paymentSummaryItems.append(
                PKPaymentSummaryItem(label: label, amount: amountD)
            )
        }
        
        if Stripe.canSubmitPaymentRequest(paymentRequest) {
            return paymentRequest
        } else {
            throw StripePluginError.InvalidApplePayRequest("invalid request")
        }
    }
    
    private func applePayOpts(call: CAPPluginCall) throws -> PKPaymentRequest  {
        let obj = call.getObject("applePayOptions")
        
        if obj == nil {
            throw StripePluginError.InvalidApplePayRequest("you must provide applePayOptions")
        }
        
        return try applePayOpts(obj: obj!)
    }
}

extension StripePlugin : PKPaymentAuthorizationViewControllerDelegate {
    public func paymentAuthorizationViewControllerDidFinish(_ controller: PKPaymentAuthorizationViewController) {
        controller.dismiss(animated: true, completion: nil)
        
        guard let ctx = self.applePayCtx else {
            return
        }
        
        if let c = self.bridge.getSavedCall(ctx.callbackId) {
            c.error("payment timeout or user cancelled")
        }
        
        self.clearApplePay()
    }
    
    @available(iOS 11.0, *)
    public func paymentAuthorizationViewController(_ controller: PKPaymentAuthorizationViewController, didAuthorizePayment payment: PKPayment, handler completion: @escaping (PKPaymentAuthorizationResult) -> Void) {
        guard let ctx = self.applePayCtx, let callback = self.bridge.getSavedCall(ctx.callbackId) else {
            completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
            self.clearApplePay()
            return
        }
        
        switch ctx.mode {
        case .PaymentIntent:
            guard let clientSecret = ctx.clientSecret else {
                completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                callback.error("unexpected error")
                self.clearApplePay()
                return
            }
            
            STPAPIClient.shared().createPaymentMethod(with: payment) { (pm, err) in
                guard let pm = pm else {
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    callback.error("unable to create payment method: " + err!.localizedDescription, err)
                    self.clearApplePay()
                    return
                }
                
                let pip: STPPaymentIntentParams = STPPaymentIntentParams.init(clientSecret: clientSecret)
                pip.paymentMethodId = pm.stripeId
                
                STPPaymentHandler.shared().confirmPayment(withParams: pip, authenticationContext: self, completion: { (status, pi, err) in
                    switch status {
                    case .failed:
                        if err != nil {
                            callback.error("payment failed: " + err!.localizedDescription, err)
                        } else {
                            callback.error("payment failed")
                        }
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()
                        
                    case .canceled:
                        callback.error("user cancelled the transaction")
                        completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                        self.clearApplePay()
                        
                    case .succeeded:
                        callback.success(pi!.allResponseFields as! PluginResultData)
                    }
                })
            }
            
        case .Token:
            STPAPIClient.shared().createToken(with: payment) { (t, err) in
                guard let t = t else {
                    completion(PKPaymentAuthorizationResult(status: .failure, errors: nil))
                    callback.error("unable to create token: " + err!.localizedDescription, err)
                    self.clearApplePay()
                    return
                }
                
                callback.success(["token": t.tokenId])
            }
        }
    }
}

extension StripePlugin : STPAuthenticationContext {
    public func authenticationPresentingViewController() -> UIViewController {
        return self.bridge?.bridgeDelegate as! UIViewController
    }
}


enum StripePluginError : Error {
    case InvalidApplePayRequest(String)
}

enum ApplePayMode {
    case PaymentIntent
    case Token
}

struct ApplePayContext {
    var callbackId: String
    var mode: ApplePayMode
    var completion: ((PKPaymentAuthorizationResult) -> Void)?
    var clientSecret: String?
}
