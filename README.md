# @capacitor-community/stripe

Stripe SDK bindings for Capacitor Applications

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`isApplePayAvailable()`](#isapplepayavailable)
* [`payWithApplePay(...)`](#paywithapplepay)
* [`cancelApplePay()`](#cancelapplepay)
* [`finalizeApplePayTransaction(...)`](#finalizeapplepaytransaction)
* [`isGooglePayAvailable()`](#isgooglepayavailable)
* [`payWithGooglePay(...)`](#paywithgooglepay)
* [`createPaymentSheet(...)`](#createpaymentsheet)
* [`presentPaymentSheet()`](#presentpaymentsheet)
* [`addListener(PaymentSheetEventsEnum.Loaded, ...)`](#addlistenerpaymentsheeteventsenumloaded-)
* [`addListener(PaymentSheetEventsEnum.FailedToLoad, ...)`](#addlistenerpaymentsheeteventsenumfailedtoload-)
* [`addListener(PaymentSheetEventsEnum.Opened, ...)`](#addlistenerpaymentsheeteventsenumopened-)
* [`addListener(PaymentSheetEventsEnum.Closed, ...)`](#addlistenerpaymentsheeteventsenumclosed-)
* [`addListener(PaymentSheetEventsEnum.Closed, ...)`](#addlistenerpaymentsheeteventsenumclosed-)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(opts: StripeInitializationOptions) => Promise<void>
```

| Param      | Type                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#stripeinitializationoptions">StripeInitializationOptions</a></code> |

--------------------


### isApplePayAvailable()

```typescript
isApplePayAvailable() => Promise<void>
```

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
isGooglePayAvailable() => Promise<void>
```

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


### createPaymentSheet(...)

```typescript
createPaymentSheet(options: CreatePaymentSheetOption) => Promise<void>
```

| Param         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#createpaymentsheetoption">CreatePaymentSheetOption</a></code> |

--------------------


### presentPaymentSheet()

```typescript
presentPaymentSheet() => Promise<void>
```

--------------------


### addListener(PaymentSheetEventsEnum.Loaded, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                             |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.Opened, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Opened, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.Closed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Closed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Closed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.Closed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Result, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Closed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### Interfaces


#### StripeInitializationOptions

| Prop                 | Type                |
| -------------------- | ------------------- |
| **`publishableKey`** | <code>string</code> |
| **`stripeAccount`**  | <code>string</code> |


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


#### FinalizeApplePayTransactionOptions

| Prop          | Type                 |
| ------------- | -------------------- |
| **`success`** | <code>boolean</code> |


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


#### CreatePaymentSheetOption

| Prop                              | Type                                       |
| --------------------------------- | ------------------------------------------ |
| **`paymentIntentUrl`**            | <code>string</code>                        |
| **`customerUrl`**                 | <code>string</code>                        |
| **`useApplePay`**                 | <code>boolean</code>                       |
| **`applePayMerchantId`**          | <code>string</code>                        |
| **`applePayMerchantCountryCode`** | <code>string</code>                        |
| **`merchantDisplayName`**         | <code>string</code>                        |
| **`style`**                       | <code>'alwaysLight' \| 'alwaysDark'</code> |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Enums


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


#### PaymentSheetEventsEnum

| Members            | Value                                   |
| ------------------ | --------------------------------------- |
| **`Loaded`**       | <code>"paymentSheetLoaded"</code>       |
| **`FailedToLoad`** | <code>"paymentSheetFailedToLoad"</code> |
| **`Opened`**       | <code>"paymentSheetOpened"</code>       |
| **`Closed`**       | <code>"paymentSheetClosed"</code>       |
| **`Result`**       | <code>"paymentSheetClosed"</code>       |

</docgen-api>
