# @capacitor-community/stripe

Stripe SDK bindings for Capacitor Applications

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

## API

<docgen-index>

* [`setPublishableKey(...)`](#setpublishablekey)
* [`createCardToken(...)`](#createcardtoken)
* [`createBankAccountToken(...)`](#createbankaccounttoken)
* [`isApplePayAvailable()`](#isapplepayavailable)
* [`payWithApplePay(...)`](#paywithapplepay)
* [`cancelApplePay()`](#cancelapplepay)
* [`finalizeApplePayTransaction(...)`](#finalizeapplepaytransaction)
* [`isGooglePayAvailable()`](#isgooglepayavailable)
* [`payWithGooglePay(...)`](#paywithgooglepay)
* [`customizePaymentAuthUI(...)`](#customizepaymentauthui)
* [`presentPaymentOptions()`](#presentpaymentoptions)
* [`validateCardNumber(...)`](#validatecardnumber)
* [`validateExpiryDate(...)`](#validateexpirydate)
* [`validateCVC(...)`](#validatecvc)
* [`identifyCardBrand(...)`](#identifycardbrand)
* [`confirmPaymentIntent(...)`](#confirmpaymentintent)
* [`confirmSetupIntent(...)`](#confirmsetupintent)
* [`initCustomerSession(...)`](#initcustomersession)
* [`customerPaymentMethods()`](#customerpaymentmethods)
* [`setCustomerDefaultSource(...)`](#setcustomerdefaultsource)
* [`addCustomerSource(...)`](#addcustomersource)
* [`deleteCustomerSource(...)`](#deletecustomersource)
* [`createSourceToken(...)`](#createsourcetoken)
* [`createPiiToken(...)`](#createpiitoken)
* [`createAccountToken(...)`](#createaccounttoken)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### setPublishableKey(...)

```typescript
setPublishableKey(opts: SetPublishableKeyOptions) => Promise<void>
```

| Param      | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#setpublishablekeyoptions">SetPublishableKeyOptions</a></code> |

--------------------


### createCardToken(...)

```typescript
createCardToken(card: CardTokenRequest) => Promise<CardTokenResponse>
```

| Param      | Type                                                          |
| ---------- | ------------------------------------------------------------- |
| **`card`** | <code><a href="#cardtokenrequest">CardTokenRequest</a></code> |

**Returns:** <code>Promise&lt;<a href="#cardtokenresponse">CardTokenResponse</a>&gt;</code>

--------------------


### createBankAccountToken(...)

```typescript
createBankAccountToken(bankAccount: BankAccountTokenRequest) => Promise<BankAccountTokenResponse>
```

| Param             | Type                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **`bankAccount`** | <code><a href="#bankaccounttokenrequest">BankAccountTokenRequest</a></code> |

**Returns:** <code>Promise&lt;<a href="#bankaccounttokenresponse">BankAccountTokenResponse</a>&gt;</code>

--------------------


### isApplePayAvailable()

```typescript
isApplePayAvailable() => Promise<AvailabilityResponse>
```

**Returns:** <code>Promise&lt;<a href="#availabilityresponse">AvailabilityResponse</a>&gt;</code>

--------------------


### payWithApplePay(...)

```typescript
payWithApplePay(options: { applePayOptions: ApplePayOptions; }) => Promise<ApplePayResponse>
```

| Param         | Type                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| **`options`** | <code>{ applePayOptions: <a href="#applepayoptions">ApplePayOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#applepayresponse">ApplePayResponse</a>&gt;</code>

--------------------


### cancelApplePay()

```typescript
cancelApplePay() => Promise<void>
```

--------------------


### finalizeApplePayTransaction(...)

```typescript
finalizeApplePayTransaction(opts: FinalizeApplePayTransactionOptions) => Promise<void>
```

| Param      | Type                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#finalizeapplepaytransactionoptions">FinalizeApplePayTransactionOptions</a></code> |

--------------------


### isGooglePayAvailable()

```typescript
isGooglePayAvailable() => Promise<AvailabilityResponse>
```

**Returns:** <code>Promise&lt;<a href="#availabilityresponse">AvailabilityResponse</a>&gt;</code>

--------------------


### payWithGooglePay(...)

```typescript
payWithGooglePay(opts: { googlePayOptions: GooglePayOptions; }) => Promise<GooglePayResponse>
```

| Param      | Type                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| **`opts`** | <code>{ googlePayOptions: <a href="#googlepayoptions">GooglePayOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#googlepayresponse">GooglePayResponse</a>&gt;</code>

--------------------


### customizePaymentAuthUI(...)

```typescript
customizePaymentAuthUI(opts: any) => Promise<void>
```

| Param      | Type             |
| ---------- | ---------------- |
| **`opts`** | <code>any</code> |

--------------------


### presentPaymentOptions()

```typescript
presentPaymentOptions() => Promise<PresentPaymentOptionsResponse>
```

**Returns:** <code>Promise&lt;<a href="#presentpaymentoptionsresponse">PresentPaymentOptionsResponse</a>&gt;</code>

--------------------


### validateCardNumber(...)

```typescript
validateCardNumber(opts: ValidateCardNumberOptions) => Promise<ValidityResponse>
```

| Param      | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#validatecardnumberoptions">ValidateCardNumberOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#validityresponse">ValidityResponse</a>&gt;</code>

--------------------


### validateExpiryDate(...)

```typescript
validateExpiryDate(opts: ValidateExpiryDateOptions) => Promise<ValidityResponse>
```

| Param      | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#validateexpirydateoptions">ValidateExpiryDateOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#validityresponse">ValidityResponse</a>&gt;</code>

--------------------


### validateCVC(...)

```typescript
validateCVC(opts: ValidateCVCOptions) => Promise<ValidityResponse>
```

| Param      | Type                                                              |
| ---------- | ----------------------------------------------------------------- |
| **`opts`** | <code><a href="#validatecvcoptions">ValidateCVCOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#validityresponse">ValidityResponse</a>&gt;</code>

--------------------


### identifyCardBrand(...)

```typescript
identifyCardBrand(opts: IdentifyCardBrandOptions) => Promise<CardBrandResponse>
```

| Param      | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#identifycardbrandoptions">IdentifyCardBrandOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#cardbrandresponse">CardBrandResponse</a>&gt;</code>

--------------------


### confirmPaymentIntent(...)

```typescript
confirmPaymentIntent(opts: ConfirmPaymentIntentOptions) => Promise<ConfirmPaymentIntentResponse>
```

| Param      | Type                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#confirmpaymentintentoptions">ConfirmPaymentIntentOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#confirmpaymentintentresponse">ConfirmPaymentIntentResponse</a>&gt;</code>

--------------------


### confirmSetupIntent(...)

```typescript
confirmSetupIntent(opts: ConfirmSetupIntentOptions) => Promise<ConfirmSetupIntentResponse>
```

| Param      | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#confirmsetupintentoptions">ConfirmSetupIntentOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#confirmsetupintentresponse">ConfirmSetupIntentResponse</a>&gt;</code>

--------------------


### initCustomerSession(...)

```typescript
initCustomerSession(opts: InitCustomerSessionParams) => Promise<void>
```

| Param      | Type                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#initcustomersessionparams">InitCustomerSessionParams</a></code> |

--------------------


### customerPaymentMethods()

```typescript
customerPaymentMethods() => Promise<CustomerPaymentMethodsResponse>
```

**Returns:** <code>Promise&lt;<a href="#customerpaymentmethodsresponse">CustomerPaymentMethodsResponse</a>&gt;</code>

--------------------


### setCustomerDefaultSource(...)

```typescript
setCustomerDefaultSource(opts: { sourceId: string; type?: string; }) => Promise<CustomerPaymentMethodsResponse>
```

| Param      | Type                                              |
| ---------- | ------------------------------------------------- |
| **`opts`** | <code>{ sourceId: string; type?: string; }</code> |

**Returns:** <code>Promise&lt;<a href="#customerpaymentmethodsresponse">CustomerPaymentMethodsResponse</a>&gt;</code>

--------------------


### addCustomerSource(...)

```typescript
addCustomerSource(opts: { sourceId: string; type?: string; }) => Promise<CustomerPaymentMethodsResponse>
```

| Param      | Type                                              |
| ---------- | ------------------------------------------------- |
| **`opts`** | <code>{ sourceId: string; type?: string; }</code> |

**Returns:** <code>Promise&lt;<a href="#customerpaymentmethodsresponse">CustomerPaymentMethodsResponse</a>&gt;</code>

--------------------


### deleteCustomerSource(...)

```typescript
deleteCustomerSource(opts: { sourceId: string; }) => Promise<CustomerPaymentMethodsResponse>
```

| Param      | Type                               |
| ---------- | ---------------------------------- |
| **`opts`** | <code>{ sourceId: string; }</code> |

**Returns:** <code>Promise&lt;<a href="#customerpaymentmethodsresponse">CustomerPaymentMethodsResponse</a>&gt;</code>

--------------------


### createSourceToken(...)

```typescript
createSourceToken(opts: CreateSourceTokenOptions) => Promise<TokenResponse>
```

| Param      | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#createsourcetokenoptions">CreateSourceTokenOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#tokenresponse">TokenResponse</a>&gt;</code>

--------------------


### createPiiToken(...)

```typescript
createPiiToken(opts: CreatePiiTokenOptions) => Promise<TokenResponse>
```

| Param      | Type                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| **`opts`** | <code><a href="#createpiitokenoptions">CreatePiiTokenOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#tokenresponse">TokenResponse</a>&gt;</code>

--------------------


### createAccountToken(...)

```typescript
createAccountToken(account: AccountParams) => Promise<TokenResponse>
```

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`account`** | <code><a href="#accountparams">AccountParams</a></code> |

**Returns:** <code>Promise&lt;<a href="#tokenresponse">TokenResponse</a>&gt;</code>

--------------------


### Interfaces


#### CardTokenResponse

| Prop       | Type                                  |
| ---------- | ------------------------------------- |
| **`card`** | <code><a href="#card">Card</a></code> |


#### Card

| Prop                       | Type                                            | Description                                 |
| -------------------------- | ----------------------------------------------- | ------------------------------------------- |
| **`id`**                   | <code>string</code>                             | Id exists for cards but not payment methods |
| **`brand`**                | <code><a href="#cardbrand">CardBrand</a></code> |                                             |
| **`country`**              | <code>string</code>                             |                                             |
| **`cvc_check`**            | <code>any</code>                                |                                             |
| **`three_d_secure_usage`** | <code>{ supported: boolean; }</code>            |                                             |
| **`last4`**                | <code>string</code>                             |                                             |
| **`funding`**              | <code>string</code>                             |                                             |
| **`exp_month`**            | <code>number</code>                             |                                             |
| **`exp_year`**             | <code>number</code>                             |                                             |
| **`object`**               | <code>string</code>                             |                                             |
| **`address_city`**         | <code>string</code>                             |                                             |
| **`address_country`**      | <code>string</code>                             |                                             |
| **`address_line1`**        | <code>string</code>                             |                                             |
| **`address_line1_check`**  | <code>string</code>                             |                                             |
| **`address_line2`**        | <code>string</code>                             |                                             |
| **`address_state`**        | <code>string</code>                             |                                             |
| **`address_zip`**          | <code>string</code>                             |                                             |
| **`address_zip_check`**    | <code>string</code>                             |                                             |
| **`dynamic_last4`**        | <code>any</code>                                |                                             |
| **`fingerprint`**          | <code>string</code>                             |                                             |
| **`metadata`**             | <code>any</code>                                |                                             |
| **`name`**                 | <code>string</code>                             |                                             |
| **`tokenization_method`**  | <code>string</code>                             |                                             |
| **`phone`**                | <code>string</code>                             |                                             |
| **`email`**                | <code>string</code>                             |                                             |


#### CardTokenRequest

| Prop                  | Type                | Description |
| --------------------- | ------------------- | ----------- |
| **`number`**          | <code>string</code> |             |
| **`exp_month`**       | <code>number</code> |             |
| **`exp_year`**        | <code>number</code> |             |
| **`cvc`**             | <code>string</code> |             |
| **`name`**            | <code>string</code> |             |
| **`address_line1`**   | <code>string</code> |             |
| **`address_line2`**   | <code>string</code> |             |
| **`address_city`**    | <code>string</code> |             |
| **`address_state`**   | <code>string</code> |             |
| **`address_country`** | <code>string</code> |             |
| **`address_zip`**     | <code>string</code> |             |
| **`currency`**        | <code>string</code> |             |
| **`phone`**           | <code>string</code> | iOS only    |
| **`email`**           | <code>string</code> | iOS only    |


#### BankAccountTokenResponse

| Prop               | Type                                                |
| ------------------ | --------------------------------------------------- |
| **`bank_account`** | <code><a href="#bankaccount">BankAccount</a></code> |


#### BankAccount

| Prop                      | Type                |
| ------------------------- | ------------------- |
| **`id`**                  | <code>string</code> |
| **`object`**              | <code>string</code> |
| **`account_holder_name`** | <code>string</code> |
| **`account_holder_type`** | <code>string</code> |
| **`bank_name`**           | <code>string</code> |
| **`country`**             | <code>string</code> |
| **`currency`**            | <code>string</code> |
| **`fingerprint`**         | <code>string</code> |
| **`last4`**               | <code>string</code> |
| **`routing_number`**      | <code>string</code> |
| **`status`**              | <code>string</code> |


#### BankAccountTokenRequest

| Prop                      | Type                |
| ------------------------- | ------------------- |
| **`country`**             | <code>string</code> |
| **`currency`**            | <code>string</code> |
| **`account_holder_name`** | <code>string</code> |
| **`account_holder_type`** | <code>string</code> |
| **`routing_number`**      | <code>string</code> |
| **`account_number`**      | <code>string</code> |


#### ApplePayResponse

| Prop        | Type                |
| ----------- | ------------------- |
| **`token`** | <code>string</code> |


#### ApplePayOptions

| Prop                        | Type                        |
| --------------------------- | --------------------------- |
| **`merchantId`**            | <code>string</code>         |
| **`country`**               | <code>string</code>         |
| **`currency`**              | <code>string</code>         |
| **`items`**                 | <code>ApplePayItem[]</code> |
| **`billingEmailAddress`**   | <code>boolean</code>        |
| **`billingName`**           | <code>boolean</code>        |
| **`billingPhoneNumber`**    | <code>boolean</code>        |
| **`billingPhoneticName`**   | <code>boolean</code>        |
| **`billingPostalAddress`**  | <code>boolean</code>        |
| **`shippingEmailAddress`**  | <code>boolean</code>        |
| **`shippingName`**          | <code>boolean</code>        |
| **`shippingPhoneNumber`**   | <code>boolean</code>        |
| **`shippingPhoneticName`**  | <code>boolean</code>        |
| **`shippingPostalAddress`** | <code>boolean</code>        |


#### ApplePayItem

| Prop         | Type                          |
| ------------ | ----------------------------- |
| **`label`**  | <code>string</code>           |
| **`amount`** | <code>string \| number</code> |


#### GooglePayResponse

| Prop          | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`success`** | <code>boolean</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`token`**   | <code>{ apiVersionMinor: number; apiVersion: number; paymentMethodData: { description: string; tokenizationData: { type: string; token: string; }; type: string; info: { cardNetwork: string; cardDetails: string; billingAddress?: { countryCode: string; postalCode: string; name: string; }; }; }; shippingAddress?: { address3: string; sortingCode: string; address2: string; countryCode: string; address1: string; postalCode: string; name: string; locality: string; administrativeArea: string; }; email?: string; }</code> |


#### GooglePayOptions

| Prop                            | Type                                                                                                                                 | Description                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`merchantName`**              | <code>string</code>                                                                                                                  | Merchant name encoded as UTF-8. Merchant name is rendered in the payment sheet. In TEST environment, or if a merchant isn't recognized, a “Pay Unverified Merchant” message is displayed in the payment sheet.                                    |
| **`totalPrice`**                | <code>string</code>                                                                                                                  | Total monetary value of the transaction with an optional decimal precision of two decimal places.                                                                                                                                                 |
| **`totalPriceStatus`**          | <code><a href="#googlepaypricestatus">GooglePayPriceStatus</a></code>                                                                | The status of the total price used                                                                                                                                                                                                                |
| **`totalPriceLabel`**           | <code>string</code>                                                                                                                  | Custom label for the total price within the display items.                                                                                                                                                                                        |
| **`checkoutOption`**            | <code>'DEFAULT' \| 'COMPLETE_IMMEDIATE_PURCHASE'</code>                                                                              | Affects the submit button text displayed in the Google Pay payment sheet.                                                                                                                                                                         |
| **`transactionId`**             | <code>string</code>                                                                                                                  | A unique ID that identifies a transaction attempt. Merchants may use an existing ID or generate a specific one for Google Pay transaction attempts. This field is required when you send callbacks to the Google Transaction Events API.          |
| **`currencyCode`**              | <code>string</code>                                                                                                                  | ISO 4217 alphabetic currency code.                                                                                                                                                                                                                |
| **`countryCode`**               | <code>string</code>                                                                                                                  | ISO 3166-1 alpha-2 country code where the transaction is processed. This is required for merchants based in European Economic Area (EEA) countries.                                                                                               |
| **`allowedAuthMethods`**        | <code>GooglePayAuthMethod[]</code>                                                                                                   | Fields supported to authenticate a card transaction.                                                                                                                                                                                              |
| **`allowedCardNetworks`**       | <code>('AMEX' \| 'DISCOVER' \| 'INTERAC' \| 'JCB' \| 'MASTERCARD' \| 'VISA')[]</code>                                                | One or more card networks that you support, also supported by the Google Pay API.                                                                                                                                                                 |
| **`allowPrepaidCards`**         | <code>boolean</code>                                                                                                                 | Set to false if you don't support prepaid cards. Default: The prepaid card class is supported for the card networks specified.                                                                                                                    |
| **`emailRequired`**             | <code>boolean</code>                                                                                                                 | Set to true to request an email address.                                                                                                                                                                                                          |
| **`billingAddressRequired`**    | <code>boolean</code>                                                                                                                 | Set to true if you require a billing address. A billing address should only be requested if it's required to process the transaction. Additional data requests can increase friction in the checkout process and lead to a lower conversion rate. |
| **`billingAddressParameters`**  | <code>{ format?: <a href="#googlepaybillingaddressformat">GooglePayBillingAddressFormat</a>; phoneNumberRequired?: boolean; }</code> |                                                                                                                                                                                                                                                   |
| **`shippingAddressRequired`**   | <code>boolean</code>                                                                                                                 | Set to true to request a full shipping address.                                                                                                                                                                                                   |
| **`shippingAddressParameters`** | <code>{ allowedCountryCodes?: string[]; phoneNumberRequired?: boolean; }</code>                                                      |                                                                                                                                                                                                                                                   |


#### PaymentMethod

| Prop             | Type                                  |
| ---------------- | ------------------------------------- |
| **`created`**    | <code>number</code>                   |
| **`customerId`** | <code>string</code>                   |
| **`id`**         | <code>string</code>                   |
| **`livemode`**   | <code>boolean</code>                  |
| **`type`**       | <code>string</code>                   |
| **`card`**       | <code><a href="#card">Card</a></code> |


#### ConfirmPaymentIntentResponse

| Prop                       | Type                                                    |
| -------------------------- | ------------------------------------------------------- |
| **`amount`**               | <code>number</code>                                     |
| **`capture_method`**       | <code>string</code>                                     |
| **`client_secret`**        | <code>string</code>                                     |
| **`confirmation_method`**  | <code>string</code>                                     |
| **`created`**              | <code>number</code>                                     |
| **`currency`**             | <code>string</code>                                     |
| **`cad`**                  | <code>string</code>                                     |
| **`livemode`**             | <code>boolean</code>                                    |
| **`object`**               | <code>string</code>                                     |
| **`payment_method`**       | <code><a href="#paymentmethod">PaymentMethod</a></code> |
| **`payment_method_types`** | <code>string[]</code>                                   |
| **`status`**               | <code>string</code>                                     |


#### ConfirmPaymentIntentOptions

| Prop                   | Type                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`setupFutureUsage`** | <code>'on_session' \| 'off_session'</code>                    | Indicates that you intend to make future payments with this PaymentIntent's payment method. If present, the payment method used with this PaymentIntent can be [attached](https://stripe.com/docs/api/payment_methods/attach) to a Customer, even after the transaction completes. Use `on_session` if you intend to only reuse the payment method when your customer is present in your checkout flow. Use `off_session` if your customer may or may not be in your checkout flow. Stripe uses `setup_future_usage` to dynamically optimize your payment flow and comply with regional legislation and network rules. For example, if your customer is impacted by [SCA](https://stripe.com/docs/strong-customer-authentication), using `off_session` will ensure that they are authenticated while processing this PaymentIntent. You will then be able to collect [off-session payments](https://stripe.com/docs/payments/cards/charging-saved-cards#off-session-payments-with-saved-cards) for this customer. If `setup_future_usage` is already set and you are performing a request using a publishable key, you may only update the value from `on_session` to `off_session`. |
| **`saveMethod`**       | <code>boolean</code>                                          | Whether you intend to save the payment method to the customer's account after this payment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **`applePayOptions`**  | <code><a href="#applepayoptions">ApplePayOptions</a></code>   | If provided, the payment intent will be confirmed using Apple Pay                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **`googlePayOptions`** | <code><a href="#googlepayoptions">GooglePayOptions</a></code> | If provided, the payment intent will be confirmed using Google Pay                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |


#### ConfirmSetupIntentResponse

| Prop                  | Type                 | Description                                       |
| --------------------- | -------------------- | ------------------------------------------------- |
| **`created`**         | <code>number</code>  | Unix timestamp representing creation time         |
| **`id`**              | <code>string</code>  | Setup intent ID                                   |
| **`isLiveMode`**      | <code>boolean</code> | Whether the setup intent was created in live mode |
| **`paymentMethodId`** | <code>string</code>  | Payment method ID                                 |
| **`status`**          | <code>string</code>  |                                                   |
| **`usage`**           | <code>string</code>  |                                                   |


#### ConfirmSetupIntentOptions

| Prop     | Type                |
| -------- | ------------------- |
| **`id`** | <code>string</code> |


#### TokenResponse

| Prop          | Type                                  |
| ------------- | ------------------------------------- |
| **`id`**      | <code>string</code>                   |
| **`type`**    | <code>string</code>                   |
| **`created`** | <code><a href="#date">Date</a></code> |


#### Date

Enables basic storage and retrieval of dates and times.

| Method                 | Signature                                                                                                    | Description                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **toString**           | () =&gt; string                                                                                              | Returns a string representation of a date. The format of the string depends on the locale.                                              |
| **toDateString**       | () =&gt; string                                                                                              | Returns a date as a string value.                                                                                                       |
| **toTimeString**       | () =&gt; string                                                                                              | Returns a time as a string value.                                                                                                       |
| **toLocaleString**     | () =&gt; string                                                                                              | Returns a value as a string value appropriate to the host environment's current locale.                                                 |
| **toLocaleDateString** | () =&gt; string                                                                                              | Returns a date as a string value appropriate to the host environment's current locale.                                                  |
| **toLocaleTimeString** | () =&gt; string                                                                                              | Returns a time as a string value appropriate to the host environment's current locale.                                                  |
| **valueOf**            | () =&gt; number                                                                                              | Returns the stored time value in milliseconds since midnight, January 1, 1970 UTC.                                                      |
| **getTime**            | () =&gt; number                                                                                              | Gets the time value in milliseconds.                                                                                                    |
| **getFullYear**        | () =&gt; number                                                                                              | Gets the year, using local time.                                                                                                        |
| **getUTCFullYear**     | () =&gt; number                                                                                              | Gets the year using Universal Coordinated Time (UTC).                                                                                   |
| **getMonth**           | () =&gt; number                                                                                              | Gets the month, using local time.                                                                                                       |
| **getUTCMonth**        | () =&gt; number                                                                                              | Gets the month of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                             |
| **getDate**            | () =&gt; number                                                                                              | Gets the day-of-the-month, using local time.                                                                                            |
| **getUTCDate**         | () =&gt; number                                                                                              | Gets the day-of-the-month, using Universal Coordinated Time (UTC).                                                                      |
| **getDay**             | () =&gt; number                                                                                              | Gets the day of the week, using local time.                                                                                             |
| **getUTCDay**          | () =&gt; number                                                                                              | Gets the day of the week using Universal Coordinated Time (UTC).                                                                        |
| **getHours**           | () =&gt; number                                                                                              | Gets the hours in a date, using local time.                                                                                             |
| **getUTCHours**        | () =&gt; number                                                                                              | Gets the hours value in a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                       |
| **getMinutes**         | () =&gt; number                                                                                              | Gets the minutes of a <a href="#date">Date</a> object, using local time.                                                                |
| **getUTCMinutes**      | () =&gt; number                                                                                              | Gets the minutes of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                           |
| **getSeconds**         | () =&gt; number                                                                                              | Gets the seconds of a <a href="#date">Date</a> object, using local time.                                                                |
| **getUTCSeconds**      | () =&gt; number                                                                                              | Gets the seconds of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                           |
| **getMilliseconds**    | () =&gt; number                                                                                              | Gets the milliseconds of a <a href="#date">Date</a>, using local time.                                                                  |
| **getUTCMilliseconds** | () =&gt; number                                                                                              | Gets the milliseconds of a <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                      |
| **getTimezoneOffset**  | () =&gt; number                                                                                              | Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC).                             |
| **setTime**            | (time: number) =&gt; number                                                                                  | Sets the date and time value in the <a href="#date">Date</a> object.                                                                    |
| **setMilliseconds**    | (ms: number) =&gt; number                                                                                    | Sets the milliseconds value in the <a href="#date">Date</a> object using local time.                                                    |
| **setUTCMilliseconds** | (ms: number) =&gt; number                                                                                    | Sets the milliseconds value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                              |
| **setSeconds**         | (sec: number, ms?: number \| undefined) =&gt; number                                                         | Sets the seconds value in the <a href="#date">Date</a> object using local time.                                                         |
| **setUTCSeconds**      | (sec: number, ms?: number \| undefined) =&gt; number                                                         | Sets the seconds value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                   |
| **setMinutes**         | (min: number, sec?: number \| undefined, ms?: number \| undefined) =&gt; number                              | Sets the minutes value in the <a href="#date">Date</a> object using local time.                                                         |
| **setUTCMinutes**      | (min: number, sec?: number \| undefined, ms?: number \| undefined) =&gt; number                              | Sets the minutes value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                   |
| **setHours**           | (hours: number, min?: number \| undefined, sec?: number \| undefined, ms?: number \| undefined) =&gt; number | Sets the hour value in the <a href="#date">Date</a> object using local time.                                                            |
| **setUTCHours**        | (hours: number, min?: number \| undefined, sec?: number \| undefined, ms?: number \| undefined) =&gt; number | Sets the hours value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                     |
| **setDate**            | (date: number) =&gt; number                                                                                  | Sets the numeric day-of-the-month value of the <a href="#date">Date</a> object using local time.                                        |
| **setUTCDate**         | (date: number) =&gt; number                                                                                  | Sets the numeric day of the month in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                        |
| **setMonth**           | (month: number, date?: number \| undefined) =&gt; number                                                     | Sets the month value in the <a href="#date">Date</a> object using local time.                                                           |
| **setUTCMonth**        | (month: number, date?: number \| undefined) =&gt; number                                                     | Sets the month value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                     |
| **setFullYear**        | (year: number, month?: number \| undefined, date?: number \| undefined) =&gt; number                         | Sets the year of the <a href="#date">Date</a> object using local time.                                                                  |
| **setUTCFullYear**     | (year: number, month?: number \| undefined, date?: number \| undefined) =&gt; number                         | Sets the year value in the <a href="#date">Date</a> object using Universal Coordinated Time (UTC).                                      |
| **toUTCString**        | () =&gt; string                                                                                              | Returns a date converted to a string using Universal Coordinated Time (UTC).                                                            |
| **toISOString**        | () =&gt; string                                                                                              | Returns a date as a string value in ISO format.                                                                                         |
| **toJSON**             | (key?: any) =&gt; string                                                                                     | Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. |


#### ThreeDeeSecureParams

| Prop            | Type                | Description                                              |
| --------------- | ------------------- | -------------------------------------------------------- |
| **`amount`**    | <code>number</code> | Amount                                                   |
| **`currency`**  | <code>string</code> | Currency code                                            |
| **`returnURL`** | <code>string</code> | URL to redirect to after successfully verifying the card |
| **`card`**      | <code>string</code> | <a href="#card">Card</a> source ID                       |


#### GiroPayParams

| Prop                      | Type                |
| ------------------------- | ------------------- |
| **`amount`**              | <code>number</code> |
| **`name`**                | <code>string</code> |
| **`returnURL`**           | <code>string</code> |
| **`statementDescriptor`** | <code>string</code> |


#### iDEALParams

| Prop                      | Type                |
| ------------------------- | ------------------- |
| **`amount`**              | <code>number</code> |
| **`name`**                | <code>string</code> |
| **`returnURL`**           | <code>string</code> |
| **`statementDescriptor`** | <code>string</code> |
| **`bank`**                | <code>string</code> |


#### SEPADebitParams

| Prop               | Type                |
| ------------------ | ------------------- |
| **`name`**         | <code>string</code> |
| **`iban`**         | <code>string</code> |
| **`addressLine1`** | <code>string</code> |
| **`city`**         | <code>string</code> |
| **`postalCode`**   | <code>string</code> |
| **`country`**      | <code>string</code> |


#### SofortParams

| Prop                      | Type                |
| ------------------------- | ------------------- |
| **`amount`**              | <code>number</code> |
| **`returnURL`**           | <code>string</code> |
| **`country`**             | <code>string</code> |
| **`statementDescriptor`** | <code>string</code> |


#### AlipayParams

| Prop            | Type                |
| --------------- | ------------------- |
| **`amount`**    | <code>number</code> |
| **`currency`**  | <code>string</code> |
| **`returnURL`** | <code>string</code> |


#### AlipayReusableParams

| Prop            | Type                |
| --------------- | ------------------- |
| **`currency`**  | <code>string</code> |
| **`returnURL`** | <code>string</code> |


#### P24Params

| Prop            | Type                |
| --------------- | ------------------- |
| **`amount`**    | <code>number</code> |
| **`currency`**  | <code>string</code> |
| **`email`**     | <code>string</code> |
| **`name`**      | <code>string</code> |
| **`returnURL`** | <code>string</code> |


#### VisaCheckoutParams

| Prop         | Type                |
| ------------ | ------------------- |
| **`callId`** | <code>string</code> |


#### AccountParams

| Prop                      | Type                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`tosShownAndAccepted`** | <code>boolean</code>                                                                                                                                    |
| **`legalEntity`**         | <code><a href="#companylegalentityparams">CompanyLegalEntityParams</a> \| <a href="#individuallegalentityparams">IndividualLegalEntityParams</a></code> |


#### CompanyLegalEntityParams

| Prop                      | Type                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**                | <code>'company'</code> |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **`name`**                | <code>string</code>    | The company’s legal name. [account.company.name](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-name)                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`owners_provided`**     | <code>boolean</code>   | Whether the company’s owners have been provided. Set this Boolean to `true` after creating all the company’s owners with the [Persons API](https://stripe.com/docs/api/persons) for accounts with a `relationship.owner` requirement. [account.company.owners_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-owners_provided)                                                                                                                                                                |
| **`directors_provided`**  | <code>boolean</code>   | Whether the company’s directors have been provided. Set this Boolean to `true` after creating all the company’s directors with the [Persons API](https://stripe.com/docs/api/persons) for accounts with a `relationship.director` requirement. This value is not automatically set to `true` after creating directors, so it needs to be updated to indicate all directors have been provided. [account.company.directors_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-directors_provided) |
| **`executives_provided`** | <code>boolean</code>   | Whether the company’s executives have been provided. Set this Boolean to `true` after creating all the company’s executives with the [Persons API](https://stripe.com/docs/api/persons) for accounts with a `relationship.executive` requirement. [account.company.executives_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-executives_provided)                                                                                                                                            |
| **`tax_id`**              | <code>string</code>    | The business ID number of the company, as appropriate for the company’s country. (Examples are an Employer ID Number in the U.S., a Business Number in Canada, or a Company Number in the UK.) [account.company.tax_id](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-tax_id)                                                                                                                                                                                                                         |
| **`tax_id_registrar`**    | <code>string</code>    | The jurisdiction in which the `tax_id` is registered (Germany-based companies only). [account.company.tax_id_registrar](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-tax_id_registrar)                                                                                                                                                                                                                                                                                                               |
| **`vat_id`**              | <code>string</code>    | The VAT number of the company. [account.company.vat_id](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-vat_id)                                                                                                                                                                                                                                                                                                                                                                                         |
| **`phone`**               | <code>string</code>    | The company’s phone number (used for verification).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |


#### IndividualLegalEntityParams

| Prop             | Type                            | Description                                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`type`**       | <code>'individual'</code>       |                                                                                                                                                                                                                                                                  |
| **`first_name`** | <code>string</code>             | The individual’s first name.                                                                                                                                                                                                                                     |
| **`last_name`**  | <code>string</code>             | The individual’s last name.                                                                                                                                                                                                                                      |
| **`email`**      | <code>string</code>             | The individual’s email.                                                                                                                                                                                                                                          |
| **`gender`**     | <code>'male' \| 'female'</code> | The individual’s gender (International regulations require either “male” or “female”).                                                                                                                                                                           |
| **`id_number`**  | <code>string</code>             | The government-issued ID number of the individual, as appropriate for the representative’s country. (Examples are a Social Security Number in the U.S., or a Social Insurance Number in Canada). Instead of the number itself, you can also provide a PII token. |
| **`phone`**      | <code>string</code>             | The individual’s phone number.                                                                                                                                                                                                                                   |
| **`ssn_last4`**  | <code>string</code>             | The last four digits of the individual’s Social Security Number (U.S. only).                                                                                                                                                                                     |


### Type Aliases


#### SetPublishableKeyOptions

<code>{ key: string; }</code>


#### AvailabilityResponse

<code>{ available: boolean }</code>


#### FinalizeApplePayTransactionOptions

<code>{ success: boolean; }</code>


#### PresentPaymentOptionsResponse

<code>{ useGooglePay?: boolean; useApplePay?: boolean; paymentMethod?: <a href="#paymentmethod">PaymentMethod</a>; }</code>


#### ValidityResponse

<code>{ valid: boolean }</code>


#### ValidateCardNumberOptions

<code>{ number: string; }</code>


#### ValidateExpiryDateOptions

<code>{ exp_month: number; exp_year: number; }</code>


#### ValidateCVCOptions

<code>{ cvc: string; }</code>


#### CardBrandResponse

<code>{ brand: <a href="#cardbrand">CardBrand</a> }</code>


#### IdentifyCardBrandOptions

<code>{ number: string; }</code>


#### InitCustomerSessionParams

<code>{ id: string; object: 'ephemeral_key'; associated_objects: { type: 'customer'; id: string; }[]; created: number; expires: number; livemode: boolean; secret: string; apiVersion?: string; } & <a href="#stripeaccountidopt">StripeAccountIdOpt</a></code>


#### StripeAccountIdOpt

<code>{ /** * Optional * Used on Android only */ stripeAccountId?: string; }</code>


#### CustomerPaymentMethodsResponse

<code>{ paymentMethods: PaymentMethod[]; }</code>


#### CreateSourceTokenOptions

<code>{ type: <a href="#sourcetype">SourceType</a>; params: <a href="#sourceparams">SourceParams</a>; }</code>


#### SourceParams

<code><a href="#threedeesecureparams">ThreeDeeSecureParams</a> | <a href="#giropayparams">GiroPayParams</a> | <a href="#idealparams">iDEALParams</a> | <a href="#sepadebitparams">SEPADebitParams</a> | <a href="#sofortparams">SofortParams</a> | <a href="#alipayparams">AlipayParams</a> | <a href="#alipayreusableparams">AlipayReusableParams</a> | <a href="#p24params">P24Params</a> | <a href="#visacheckoutparams">VisaCheckoutParams</a></code>


#### CreatePiiTokenOptions

<code>{ pii: string; } & <a href="#stripeaccountidopt">StripeAccountIdOpt</a> & <a href="#idempotencykeyopt">IdempotencyKeyOpt</a></code>


#### IdempotencyKeyOpt

<code>{ /** * Optional * Used on Android only */ idempotencyKey?: string; }</code>


### Enums


#### CardBrand

| Members                | Value                           |
| ---------------------- | ------------------------------- |
| **`AMERICAN_EXPRESS`** | <code>'American Express'</code> |
| **`DISCOVER`**         | <code>'Discover'</code>         |
| **`JCB`**              | <code>'JCB'</code>              |
| **`DINERS_CLUB`**      | <code>'Diners Club'</code>      |
| **`VISA`**             | <code>'Visa'</code>             |
| **`MASTERCARD`**       | <code>'MasterCard'</code>       |
| **`UNIONPAY`**         | <code>'UnionPay'</code>         |
| **`UNKNOWN`**          | <code>'Unknown'</code>          |


#### GooglePayPriceStatus

| Members                   | Value                              | Description                                                                                                          |
| ------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **`NOT_CURRENTLY_KNOWN`** | <code>'NOT_CURRENTLY_KNOWN'</code> | Used for a capability check. Do not use this property if the transaction is processed in an EEA country.             |
| **`ESTIMATED`**           | <code>'ESTIMATED'</code>           | Total price may adjust based on the details of the response, such as sales tax collected based on a billing address. |
| **`FINAL`**               | <code>'FINAL'</code>               | Total price doesn't change from the amount presented to the shopper.                                                 |


#### GooglePayAuthMethod

| Members              | Value                         | Description                                                                                                                                                                                                                |
| -------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`PAN_ONLY`**       | <code>'PAN_ONLY'</code>       | This authentication method is associated with payment cards stored on file with the user's Google Account. Returned payment data includes personal account number (PAN) with the expiration month and the expiration year. |
| **`CRYPTOGRAM_3DS`** | <code>'CRYPTOGRAM_3DS'</code> | This authentication method is associated with cards stored as Android device tokens. Returned payment data includes a 3-D Secure (3DS) cryptogram generated on the device.                                                 |


#### GooglePayBillingAddressFormat

| Members    | Value               | Description                                                            |
| ---------- | ------------------- | ---------------------------------------------------------------------- |
| **`MIN`**  | <code>'MIN'</code>  | Name, country code, and postal code (default).                         |
| **`FULL`** | <code>'FULL'</code> | Name, street address, locality, region, country code, and postal code. |


#### SourceType

| Members              | Value                         |
| -------------------- | ----------------------------- |
| **`ThreeDeeSecure`** | <code>'3ds'</code>            |
| **`GiroPay`**        | <code>'giropay'</code>        |
| **`iDEAL`**          | <code>'ideal'</code>          |
| **`SEPADebit`**      | <code>'sepadebit'</code>      |
| **`Sofort`**         | <code>'sofort'</code>         |
| **`AliPay`**         | <code>'alipay'</code>         |
| **`AliPayReusable`** | <code>'alipayreusable'</code> |
| **`P24`**            | <code>'p24'</code>            |
| **`VisaCheckout`**   | <code>'visacheckout'</code>   |

</docgen-api>
