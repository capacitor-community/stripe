import Foundation
import Capacitor
import Stripe
import PassKit



@objc(StripePlugin)
public class StripePlugin: CAPPlugin {
    internal var applePayCtx: ApplePayContext?
    internal var ephemeralKey: NSDictionary?
    internal var customerCtx: STPCustomerContext?
    internal var paymentCtx: STPPaymentContext?
    internal var pCfg: STPPaymentConfiguration?

    internal var ERR_NO_ACTIVE_CUSTOMER_CTX = "No active customer session was found. You must create one by calling initCustomerSession"

    @objc func setStripeAccount(_ call: CAPPluginCall) {
        let value = call.getString("stripe_account") ?? ""

        if value == "" {
            call.error("you must provide a valid stripe account id")
            return
        }

        STPAPIClient.shared().stripeAccount = value

        call.success()
    }

    @objc func setPublishableKey(_ call: CAPPluginCall) {
        let value = call.getString("key") ?? ""

        if value == "" {
            call.error("you must provide a valid key")
            return
        }

        StripeAPI.defaultPublishableKey = value

        call.success()
    }

    @objc func validateCardNumber(_ call: CAPPluginCall) {
        let state = STPCardValidator.validationState(
                forNumber: call.getString("number"),
                validatingCardBrand: false
        )

        call.success([
            "valid": state == STPCardValidationState.valid
        ])
    }

    @objc func validateExpiryDate(_ call: CAPPluginCall) {
        let state = STPCardValidator.validationState(
                forExpirationYear: call.getString("exp_year") ?? "",
                inMonth: call.getString("exp_month") ?? ""
        )

        call.success([
            "valid": state == STPCardValidationState.valid
        ])
    }

    @objc func validateCVC(_ call: CAPPluginCall) {
        let state = STPCardValidator.validationState(
                forCVC: (call.getString("cvc")) ?? "",
                cardBrand: strToBrand(call.getString("brand"))
        )

        call.success([
            "valid": state == STPCardValidationState.valid
        ])
    }

    @objc func identifyCardBrand(_ call: CAPPluginCall) {
        let val = STPCardValidator.brand(forNumber: call.getString("number") ?? "")

        call.success([
            "brand": STPCardBrandUtilities.stringFrom(val) ?? "unknown"
        ])
    }

    @objc func createCardToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }

        let params = cardParams(fromCall: call)

        STPAPIClient.shared.createToken(withCard: params) { (token, error) in
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

        let params = makeBankAccountParams(call: call.options)

        STPAPIClient.shared.createToken(withBankAccount: params) { (token, error) in
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
            let s: PKPaymentAuthorizationStatus = success ? .success : .failure
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

        case .unknown:

        }
       */
    }

    @objc func createPiiToken(_ call: CAPPluginCall) {
        if !ensurePluginInitialized(call) {
            return
        }

        let pii = call.getString("pii") ?? ""

        STPAPIClient.shared.createToken(withPersonalIDNumber: pii) { (token, error) in
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
                self.applePayCtx = ApplePayContext(callbackId: call.callbackId,
                                                   mode: .PaymentIntent,
                                                   completion: nil,
                                                   clientSecret: clientSecret)

                DispatchQueue.main.async {
                    self.bridge.viewController.present(authCtrl,
                                                       animated: true,
                                                       completion: nil)
                }
                return
            }

            call.error("invalid payment request")
            return
        } else if call.hasOption("googlePayOptions") {
            call.error("GooglePay is not supported on iOS")
            return
        }

        let pip: STPPaymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecret!)

        if let sm = call.getBool("saveMethod"), sm == true {
            pip.savePaymentMethod = true
        }

        if call.hasOption("redirectUrl") {
            pip.returnURL = call.getString("redirectUrl")
        }

        if call.hasOption("card") {
            let bd = STPPaymentMethodBillingDetails()
            let bda = address(fromCall: call)
            bd.address = bda.map { STPPaymentMethodAddress(address: $0) }

            let cpp = cardParams(fromObj: call.getObject("card") ?? [:]) ?? STPCardParams()
            if let bda = bda {
                cpp.address = bda
            }
            let pmp = STPPaymentMethodParams(card: STPPaymentMethodCardParams(cardSourceParams: cpp), billingDetails: bd, metadata: nil)
            pip.paymentMethodParams = pmp
        } else if call.hasOption("paymentMethodId") {
            pip.paymentMethodId = call.getString("paymentMethodId")
        } else if call.hasOption("sourceId") {
            pip.sourceId = call.getString("sourceId")
        }

        let pm = STPPaymentHandler.shared()

        pm.confirmPayment(pip, with: self) { (status, pi, err) in
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
                call.success(pi!.allResponseFields as! PluginResultData)
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

        let pip: STPSetupIntentConfirmParams = STPSetupIntentConfirmParams(clientSecret: clientSecret!)

        if call.hasOption("redirectUrl") {
           pip.returnURL = call.getString("redirectUrl")
        }

        if call.hasOption("card") {
            let bd = STPPaymentMethodBillingDetails()
            let bda = address(fromCall: call)
            bd.address = bda.map { STPPaymentMethodAddress(address: $0) }

            let cpp = cardParams(fromObj: call.getObject("card") ?? [:]) ?? STPCardParams()
            if let bda = bda {
                cpp.address = bda
            }
            let pmp = STPPaymentMethodParams(card: STPPaymentMethodCardParams(cardSourceParams: cpp), billingDetails: bd, metadata: nil)
            pip.paymentMethodParams = pmp
        } else if call.hasOption("paymentMethodId") {
            pip.paymentMethodID = call.getString("paymentMethodId")
        }

        let pm = STPPaymentHandler.shared()

        pm.confirmSetupIntent(pip, with: self) { (status, si, err) in
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
                call.success(si?.paymentMethodID.map { ["paymentMethodId": $0] } ?? [:])
            }
        }
    }

    @objc func initCustomerSession(_ call: CAPPluginCall) {
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
        let pCfg = STPPaymentConfiguration.shared

        if let po = call.getObject("paymentOptions") as? [String: Bool] {
            if po["applePay"] ?? false {
                pCfg.applePayEnabled = true
            }
            if po["fpx"] ?? false {
                pCfg.fpxEnabled = true
            }
            if po["default"] ?? false {
                // TODO The additionalPaymentOptions is no longer an object, and has been deprecated
                // There are clear alternatives for the other usages, but this does not seem to have a clear alternative.
                // I believe that the alternative is to simply not do anything, but I cannot find any explanations of what this did before the switch to stripe 21
             //   pCfg.additionalPaymentOptions.insert(.default)
            }
        }

        let rbaf = call.getString("requiredBillingAddressFields")

        switch rbaf {
        case "full":
            pCfg.requiredBillingAddressFields = .full
        case "zip":
            pCfg.requiredBillingAddressFields = .postalCode
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
        self.pCfg = pCfg

        call.success()
    }

    @objc func presentPaymentOptions(_ call: CAPPluginCall) {
        guard let pCfg = self.pCfg, let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        let pCtx = STPPaymentContext(customerContext:  ctx,
                                     configuration: pCfg,
                                     theme: STPTheme.defaultTheme)

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.presentPaymentOptionsViewController()
        }

        call.save()
    }

    @objc func presentShippingOptions(_ call: CAPPluginCall) {
        guard let pCfg = self.pCfg, let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        let pCtx = STPPaymentContext(customerContext: ctx,
                                     configuration: pCfg,
                                     theme: STPTheme.defaultTheme)

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.presentShippingViewController()
        }
    }

    @objc func presentPaymentRequest(_ call: CAPPluginCall) {
        guard let pCfg = self.pCfg, let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        let pCtx = STPPaymentContext(customerContext: ctx,
                                     configuration: pCfg,
                                     theme: STPTheme.defaultTheme)

        DispatchQueue.main.async {
            pCtx.delegate = self
            pCtx.hostViewController = self.bridge.viewController
            pCtx.paymentAmount = 5151
            pCtx.requestPayment()
        }
    }

    @objc func customizePaymentAuthUI(_ call: CAPPluginCall) {
        call.error("not implemented yet")
    }

    @objc func initPaymentSession(_ call: CAPPluginCall) {
        guard let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
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
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        ctx.listPaymentMethodsForCustomer { methods, error in
            guard let methods = methods else {
                call.error(error?.localizedDescription ?? "unknown error")
                return
            }

            var vals: [[String: Any]] = []

            for m in methods {
                let val = pmToJSON(m: m)
                vals.append(val)
            }

            call.success([
                "paymentMethods": vals,
            ])
        }
    }

    @objc func setCustomerDefaultSource(_ call: CAPPluginCall) {
        call.error("not supported on iOS")
    }

    @objc func addCustomerSource(_ call: CAPPluginCall) {
        guard let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        guard let pm = STPPaymentMethod.decodedObject(fromAPIResponse: [
            "type": call.getString("type") as Any,
            "id": call.getString("sourceId") as Any,
        ]) else {
            call.error("failed to decode object as a PaymentMethod")
            return
        }

        ctx.attachPaymentMethod(toCustomer: pm, completion: { (err) in
            if (err != nil) {
                call.error(err!.localizedDescription)
                return
            }

            self.customerPaymentMethods(call)
        })
    }

    @objc func deleteCustomerSource(_ call: CAPPluginCall) {
        guard let ctx = self.customerCtx else {
            call.error(ERR_NO_ACTIVE_CUSTOMER_CTX)
            return
        }

        guard let pm = STPPaymentMethod.decodedObject(fromAPIResponse: [
                   "id": call.getString("sourceId") as Any,
               ]) else {
                   call.error("failed to decode object as a PaymentMethod")
                   return
               }

        ctx.detachPaymentMethod(fromCustomer: pm) { (err) in
            if (err != nil) {
                call.error(err!.localizedDescription)
                return
            }

            self.customerPaymentMethods(call)
        }
    }

    @objc func isApplePayAvailable(_ call: CAPPluginCall) {
        call.success([
            "available": StripeAPI.deviceSupportsApplePay()
        ])
    }

    @objc func isGooglePayAvailable(_ call: CAPPluginCall) {
        call.success([
            "available": false
        ])
    }

    @objc func payWithGooglePay(_ call: CAPPluginCall) {
        call.error("Google Pay is not available on iOS")
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
