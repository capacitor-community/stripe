import Foundation
import Capacitor
import Stripe

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    internal var applePayCtx: ApplePayContext?
    
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
              forExpirationYear: call.getString("exp_year") ?? "",
              inMonth: call.getString("exp_month") ?? ""
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

    @objc internal func clearApplePay() {
        guard let ctx = self.applePayCtx else {
            return
        }
        
        if let c = self.bridge.getSavedCall(ctx.callbackId) {
            self.bridge.releaseCall(c)
        }
        
        self.applePayCtx = nil
    }
}