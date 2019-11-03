import Foundation
import Capacitor
import Stripe

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    var applePayCallbackId: String?
    var applePaySucceeded: Bool?
    
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
            )
        ])
    }
    
    @objc func validateExpiryDate(_ call: CAPPluginCall) {
        call.success([
            "valid": STPCardValidator.validationState(
              forExpirationYear: call.getString("expYear") ?? "",
              inMonth: call.getString("expMonth") ?? ""
            )
        ])
    }
    
    @objc func validateCVC(_ call: CAPPluginCall) {
        call.success([
            "valid": STPCardValidator.validationState(
                forCVC: (call.getString("cvc")) ?? "",
                cardBrand: strToBrand(call.getString("brand"))
            )
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
        let merchantIdentifier = call.getString("merchantIdentifier") ?? ""
        let country = call.getString("country") ?? ""
        let currency = call.getString("currency") ?? ""
        let items = call.getArray("items", [String:Any].self, [])
        
        if merchantIdentifier == "" {
            call.error("you must provide a valid merchant identifier")
            return
        }
        
        if country == "" {
            call.error("you must provide a country")
            return
        }
        
        if currency == "" {
            call.error("you must provide a currency")
            return
        }
        
        let paymentRequest = Stripe.paymentRequest(withMerchantIdentifier: merchantIdentifier, country: country, currency: currency)
    
        paymentRequest.paymentSummaryItems = []
        
        for it in items! {
            let label = it["label"] as? String ?? ""
            let amount = it["amount"] as? NSDecimalNumber ?? 0
            paymentRequest.paymentSummaryItems.append(
                PKPaymentSummaryItem(label: label, amount: amount)
            )
        }
        
        if Stripe.canSubmitPaymentRequest(paymentRequest), let authCtrl = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
            authCtrl.delegate = self.bridge.viewController as? PKPaymentAuthorizationViewControllerDelegate
            
            self.bridge.viewController.present(authCtrl, animated: true)
        
            return
        }
        
        call.error("invalid payment request")
    }
    
    @objc func startApplePayTransaction(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
    }
    
    @objc func finalizeApplePayTransaction(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }
        
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
        } else if call.getBool("fromApplePay", false) ?? false {
            
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
        
        p.name = fromObj["name"] as? String ?? ""
        p.currency = fromObj["currency"] as? String ?? ""
        
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
        let c = fromCall.dictionaryWithValues(forKeys: [
          "number", "cvc", "expMonth", "expYear", "name", "currency"
        ])
        let a = addressDict(fromCall: fromCall)
        return cardParams(fromObj: c, withAddress: a)
    }
}
