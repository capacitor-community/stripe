import Foundation
import Capacitor
import Stripe

@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    internal var applePayCtx: ApplePayContext?
    internal var ephemeralKey: NSDictionary?
    internal var customerCtx: STPCustomerContext?
    internal var paymentCtx: STPPaymentContext?

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
            guard let token = token else {
                call.error("unable to create bank account token: " + error!.localizedDescription, error)
                return
            }

            call.resolve(token.allResponseFields as! PluginResultData)
        }
    }

    @objc func payWithApplePay(_ call: CAPPluginCall) {
        let paymentRequest: PKPaymentRequest!

        do {
            paymentRequest = try applePayOpts(call: call)
        } catch let err {
            call.error("unable to parse apple pay options: " + err.localizedDescription, err)
            return
        }

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
            call.success()
        } else {
            call.error("unable to complete the payment")
        }

        self.clearApplePay()
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

        if call.hasOption("applePayOptions") {
            let paymentRequest: PKPaymentRequest!

            do {
                paymentRequest = try applePayOpts(call: call)
            } catch let err {
                call.error("unable to parse apple pay options: " + err.localizedDescription, err)
                return
            }

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
            return
        }

        //let redirectUrl = call.getString("redirectUrl") ?? ""
        let pip: STPPaymentIntentParams = STPPaymentIntentParams.init(clientSecret: clientSecret!)

        if let sm = call.getBool("saveMethod"), sm == true {
            pip.savePaymentMethod = true
        }
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

    @objc func createCustomerContext(_ call: CAPPluginCall) {
        guard
                let id = call.getString("id"),
                let object = call.getString("object"),
                let associatedObjects = call.getArray("associated_objects", [String: String].self),
                let created = call.getInt("created"),
                let expires = call.getInt("expires"),
                let livemode = call.getBool("livemode"),
                let secret = call.getString("secret") else {
            call.error("invalid ephemeral options")
            return
        }

        self.ephemeralKey = [
            "id": id,
            "object": object,
            "associated_objects": associatedObjects,
            "created": created,
            "expires": expires,
            "livemode": livemode,
            "secret": secret
        ]

        let ctx = STPCustomerContext(keyProvider: self)
        let pCfg = STPPaymentConfiguration.shared()

        if let po = call.getObject("paymentOptions") as? [String: Bool] {
            if po["applePay"] ?? false {
                pCfg.additionalPaymentOptions.insert(.applePay)
            }
            if po["fpx"] ?? false {
                pCfg.additionalPaymentOptions.insert(.FPX)
            }
            if po["default"] ?? false {
                pCfg.additionalPaymentOptions.insert(.default)
            }
        }

        let rbaf = call.getString("requiredBillingAddressFields")

        switch rbaf {
        case "full":
            pCfg.requiredBillingAddressFields = .full
        case "zip":
            pCfg.requiredBillingAddressFields = .zip
        case "name":
            pCfg.requiredBillingAddressFields = .name
        default:
            pCfg.requiredBillingAddressFields = .none
        }

        if call.getString("shippingType") ?? "" == "delivery" {
            pCfg.shippingType = .delivery
        }

        if let ac = call.getArray("availableCountries", String.self) {
            pCfg.availableCountries = Set(ac)
        }

        if let cn = call.getString("companyName") {
            pCfg.companyName = cn
        }

        if let amid = call.getString("appleMerchantIdentifier") {
            pCfg.appleMerchantIdentifier = amid
        }

        self.customerCtx = ctx
        let theme = STPTheme.default()
        self.paymentCtx = STPPaymentContext(customerContext: ctx, configuration: pCfg, theme: theme)
        call.success()
    }

    @objc func presentPaymentOptions(_ call: CAPPluginCall) {
        guard let pCtx = self.paymentCtx else {
            call.error("you must call initPaymentSession first")
            return
        }

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.presentPaymentOptionsViewController()
        }

        call.success()
    }

    @objc func presentShippingOptions(_ call: CAPPluginCall) {
        guard let pCtx = self.paymentCtx else {
            call.reject("payment context does not exists")
            return
        }

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.presentShippingViewController()
        }
    }

    @objc func presentPaymentRequest(_ call: CAPPluginCall) {
        guard let pCtx = self.paymentCtx else {
            call.reject("payment context does not exists")
            return
        }

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.paymentAmount = 5151
            pCtx.requestPayment()
        }
    }

    @objc func customizePaymentAuthUI(_ call: CAPPluginCall) {

    }

    @objc func initCustomerSession(_ call: CAPPluginCall) {
        self.ephemeralKey = NSDictionary(dictionary: call.options)
        self.customerCtx = STPCustomerContext(keyProvider: self)
    }

    @objc func initPaymentSession(_ call: CAPPluginCall) {
        guard let ctx = self.customerCtx else {
            call.error("you must call initCustomerSession first")
            return
        }

        self.paymentCtx = STPPaymentContext(customerContext: ctx)
        self.paymentCtx!.delegate = self
        self.paymentCtx!.hostViewController = self.bridge.viewController

        if let amount = call.getInt("paymentAmount") {
            self.paymentCtx!.paymentAmount = amount
        }

        call.success()
    }

    @objc func customerPaymentMethods(_ call: CAPPluginCall) {
        guard let ctx = self.customerCtx else {
            call.error("you must call initCustomerSession first")
            return
        }

        ctx.listPaymentMethodsForCustomer { methods, error in
            guard let methods = methods else {
                call.error(error?.localizedDescription ?? "unknown error")
                return
            }

            var vals: [[String: Any]] = []

            for m in methods {
                var val: [String: Any] = [
                    "id": m.stripeId,
                    "livemode": m.liveMode,
                    "type": m.type,
                ]

                if let cid = m.customerId {
                    val["customerId"] = cid
                }

                if let c = m.created {
                    val["created"] = c
                }

                if let c = m.card {
                    var cval: [String: Any] = [
                        "brand": brandToStr(c.brand),
                        "exp_month": c.expMonth,
                        "exp_year": c.expYear,
                    ]

                    if let c = c.country {
                        cval["country"] = c
                    }

                    if let f = c.funding {
                        cval["funding"] = f
                    }

                    if let l = c.last4 {
                        cval["last4"] = l
                    }

                    if let t = c.threeDSecureUsage {
                        cval["three_d_secure_usage"] = [
                            "supported": t.supported
                        ]
                    }

                    if let c = c.checks {
                        // TODO convert enum values to strings
                        cval["checks"] = [
                            "address_line1_check": c.addressLine1Check,
                            "address_postal_code_check": c.addressPostalCodeCheck,
                            "cvc_check": c.cvcCheck
                        ]
                    }
                }

                vals.append(val)
            }

            call.success([
                "paymentMethods": vals,
            ])
        }
    }

    @objc func setCustomerDefaultSource(_ call: CAPPluginCall) {
        call.error("not implemented yet")
        // TODO figure out how the SDK UI updates the API
        /*
        guard let sourceId = call.getString("sourceId") else {
            call.error("you must provide a sourceId")
            return
        }

        guard let ctx = self.customerCtx else {
            call.error("you must call initCustomerSession first")
            return
        }

        let type = call.getString("type") ?? "card"
        */
    }

    @objc func addCustomerSource(_ call: CAPPluginCall) {
        call.error("not implemented yet")
        // TODO figure out how the SDK UI updates the API
        //        guard let sourceId = call.getString("sourceId") else {
        //            call.error("you must provide a sourceId")
        //            return
        //        }
        //
        //        guard let ctx = self.customerCtx else {
        //            call.error("you must call initCustomerSession first")
        //            return
        //        }
        //
        //        let type = call.getString("type") ?? "card"
        //
        //        let m = STPPaymentMethod()
        //        STPPaymentMethod()
        //
        //        STPAPIClient.shared().retrieveSource(withId: sourceId, clientSecret: "") { source, error in
        //
        //        }
        //
        //        ctx.attachPaymentMethod(toCustomer: m) { error in
        //            if error != nil {
        //                call.error(error!.localizedDescription, error)
        //            } else {
        //                call.success()
        //            }
        //        }
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
