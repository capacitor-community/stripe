# @capacitor-community/stripe

Stripe SDK bindings for Capacitor Applications

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

## How to use

Learn at [the official @capacitor-community/stripe documentation](https://stripe.capacitorjs.jp/).

日本語版をご利用の際は [ja.stripe.capacitorjs.jp](https://ja.stripe.capacitorjs.jp/) をご確認ください。

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`handleURLCallback(...)`](#handleurlcallback)
* [`isApplePayAvailable()`](#isapplepayavailable)
* [`createApplePay(...)`](#createapplepay)
* [`presentApplePay()`](#presentapplepay)
* [`addListener(ApplePayEventsEnum.Loaded, ...)`](#addlistenerapplepayeventsenumloaded-)
* [`addListener(ApplePayEventsEnum.FailedToLoad, ...)`](#addlistenerapplepayeventsenumfailedtoload-)
* [`addListener(ApplePayEventsEnum.Completed, ...)`](#addlistenerapplepayeventsenumcompleted-)
* [`addListener(ApplePayEventsEnum.Canceled, ...)`](#addlistenerapplepayeventsenumcanceled-)
* [`addListener(ApplePayEventsEnum.Failed, ...)`](#addlistenerapplepayeventsenumfailed-)
* [`addListener(ApplePayEventsEnum.DidSelectShippingContact, ...)`](#addlistenerapplepayeventsenumdidselectshippingcontact-)
* [`addListener(ApplePayEventsEnum.DidCreatePaymentMethod, ...)`](#addlistenerapplepayeventsenumdidcreatepaymentmethod-)
* [`isGooglePayAvailable()`](#isgooglepayavailable)
* [`createGooglePay(...)`](#creategooglepay)
* [`presentGooglePay()`](#presentgooglepay)
* [`addListener(GooglePayEventsEnum.Loaded, ...)`](#addlistenergooglepayeventsenumloaded-)
* [`addListener(GooglePayEventsEnum.FailedToLoad, ...)`](#addlistenergooglepayeventsenumfailedtoload-)
* [`addListener(GooglePayEventsEnum.Completed, ...)`](#addlistenergooglepayeventsenumcompleted-)
* [`addListener(GooglePayEventsEnum.Canceled, ...)`](#addlistenergooglepayeventsenumcanceled-)
* [`addListener(GooglePayEventsEnum.Failed, ...)`](#addlistenergooglepayeventsenumfailed-)
* [`createPaymentFlow(...)`](#createpaymentflow)
* [`presentPaymentFlow()`](#presentpaymentflow)
* [`confirmPaymentFlow()`](#confirmpaymentflow)
* [`addListener(PaymentFlowEventsEnum.Loaded, ...)`](#addlistenerpaymentfloweventsenumloaded-)
* [`addListener(PaymentFlowEventsEnum.FailedToLoad, ...)`](#addlistenerpaymentfloweventsenumfailedtoload-)
* [`addListener(PaymentFlowEventsEnum.Opened, ...)`](#addlistenerpaymentfloweventsenumopened-)
* [`addListener(PaymentFlowEventsEnum.Completed, ...)`](#addlistenerpaymentfloweventsenumcompleted-)
* [`addListener(PaymentFlowEventsEnum.Canceled, ...)`](#addlistenerpaymentfloweventsenumcanceled-)
* [`addListener(PaymentFlowEventsEnum.Failed, ...)`](#addlistenerpaymentfloweventsenumfailed-)
* [`addListener(PaymentFlowEventsEnum.Created, ...)`](#addlistenerpaymentfloweventsenumcreated-)
* [`createPaymentSheet(...)`](#createpaymentsheet)
* [`presentPaymentSheet()`](#presentpaymentsheet)
* [`addListener(PaymentSheetEventsEnum.Loaded, ...)`](#addlistenerpaymentsheeteventsenumloaded-)
* [`addListener(PaymentSheetEventsEnum.FailedToLoad, ...)`](#addlistenerpaymentsheeteventsenumfailedtoload-)
* [`addListener(PaymentSheetEventsEnum.Completed, ...)`](#addlistenerpaymentsheeteventsenumcompleted-)
* [`addListener(PaymentSheetEventsEnum.Canceled, ...)`](#addlistenerpaymentsheeteventsenumcanceled-)
* [`addListener(PaymentSheetEventsEnum.Failed, ...)`](#addlistenerpaymentsheeteventsenumfailed-)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
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


### handleURLCallback(...)

```typescript
handleURLCallback(opts: StripeURLHandlingOptions) => Promise<void>
```

iOS Only

| Param      | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#stripeurlhandlingoptions">StripeURLHandlingOptions</a></code> |

--------------------


### isApplePayAvailable()

```typescript
isApplePayAvailable() => Promise<void>
```

--------------------


### createApplePay(...)

```typescript
createApplePay(options: CreateApplePayOption) => Promise<void>
```

| Param         | Type                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code><a href="#createapplepayoption">CreateApplePayOption</a></code> |

--------------------


### presentApplePay()

```typescript
presentApplePay() => Promise<{ paymentResult: ApplePayResultInterface; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#applepayresultinterface">ApplePayResultInterface</a>; }&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.Loaded, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.DidSelectShippingContact, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.DidSelectShippingContact, listenerFunc: (data: DidSelectShippingContact) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.DidSelectShippingContact</a></code>       |
| **`listenerFunc`** | <code>(data: <a href="#didselectshippingcontact">DidSelectShippingContact</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.DidCreatePaymentMethod, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.DidCreatePaymentMethod, listenerFunc: (data: DidSelectShippingContact) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.DidCreatePaymentMethod</a></code>         |
| **`listenerFunc`** | <code>(data: <a href="#didselectshippingcontact">DidSelectShippingContact</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### isGooglePayAvailable()

```typescript
isGooglePayAvailable() => Promise<void>
```

--------------------


### createGooglePay(...)

```typescript
createGooglePay(options: CreateGooglePayOption) => Promise<void>
```

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#creategooglepayoption">CreateGooglePayOption</a></code> |

--------------------


### presentGooglePay()

```typescript
presentGooglePay() => Promise<{ paymentResult: GooglePayResultInterface; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#googlepayresultinterface">GooglePayResultInterface</a>; }&gt;</code>

--------------------


### addListener(GooglePayEventsEnum.Loaded, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(GooglePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(GooglePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                    |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(GooglePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(GooglePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Failed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### createPaymentFlow(...)

```typescript
createPaymentFlow(options: CreatePaymentFlowOption) => Promise<void>
```

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#createpaymentflowoption">CreatePaymentFlowOption</a></code> |

--------------------


### presentPaymentFlow()

```typescript
presentPaymentFlow() => Promise<{ cardNumber: string; }>
```

**Returns:** <code>Promise&lt;{ cardNumber: string; }&gt;</code>

--------------------


### confirmPaymentFlow()

```typescript
confirmPaymentFlow() => Promise<{ paymentResult: PaymentFlowResultInterface; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#paymentflowresultinterface">PaymentFlowResultInterface</a>; }&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Loaded, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                              |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Opened, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentFlowEventsEnum.Created, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Created, listenerFunc: (info: { cardNumber: string; }) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Created</a></code> |
| **`listenerFunc`** | <code>(info: { cardNumber: string; }) =&gt; void</code>                         |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

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
presentPaymentSheet() => Promise<{ paymentResult: PaymentSheetResultInterface; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#paymentsheetresultinterface">PaymentSheetResultInterface</a>; }&gt;</code>

--------------------


### addListener(PaymentSheetEventsEnum.Loaded, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentSheetEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                                |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentSheetEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentSheetEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                         |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### addListener(PaymentSheetEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### StripeInitializationOptions

| Prop                 | Type                | Description                                       |
| -------------------- | ------------------- | ------------------------------------------------- |
| **`publishableKey`** | <code>string</code> |                                                   |
| **`stripeAccount`**  | <code>string</code> | Optional. Making API calls for connected accounts |


#### StripeURLHandlingOptions

| Prop      | Type                |
| --------- | ------------------- |
| **`url`** | <code>string</code> |


#### CreateApplePayOption

| Prop                                   | Type                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------- |
| **`paymentIntentClientSecret`**        | <code>string</code>                                                           |
| **`paymentSummaryItems`**              | <code>{ label: string; amount: number; }[]</code>                             |
| **`merchantIdentifier`**               | <code>string</code>                                                           |
| **`countryCode`**                      | <code>string</code>                                                           |
| **`currency`**                         | <code>string</code>                                                           |
| **`requiredShippingContactFields`**    | <code>('postalAddress' \| 'phoneNumber' \| 'emailAddress' \| 'name')[]</code> |
| **`allowedCountries`**                 | <code>string[]</code>                                                         |
| **`allowedCountriesErrorDescription`** | <code>string</code>                                                           |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### DidSelectShippingContact

| Prop          | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`contact`** | <code><a href="#shippingcontact">ShippingContact</a></code> |


#### ShippingContact

| Prop                        | Type                | Description    |
| --------------------------- | ------------------- | -------------- |
| **`givenName`**             | <code>string</code> | Apple Pay only |
| **`familyName`**            | <code>string</code> | Apple Pay only |
| **`middleName`**            | <code>string</code> | Apple Pay only |
| **`namePrefix`**            | <code>string</code> | Apple Pay only |
| **`nameSuffix`**            | <code>string</code> | Apple Pay only |
| **`nameFormatted`**         | <code>string</code> | Apple Pay only |
| **`phoneNumber`**           | <code>string</code> | Apple Pay only |
| **`nickname`**              | <code>string</code> | Apple Pay only |
| **`street`**                | <code>string</code> | Apple Pay only |
| **`city`**                  | <code>string</code> | Apple Pay only |
| **`state`**                 | <code>string</code> | Apple Pay only |
| **`postalCode`**            | <code>string</code> | Apple Pay only |
| **`country`**               | <code>string</code> | Apple Pay only |
| **`isoCountryCode`**        | <code>string</code> | Apple Pay only |
| **`subAdministrativeArea`** | <code>string</code> | Apple Pay only |
| **`subLocality`**           | <code>string</code> | Apple Pay only |


#### CreateGooglePayOption

| Prop                            | Type                                              | Description                                  |
| ------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code>                               |                                              |
| **`paymentSummaryItems`**       | <code>{ label: string; amount: number; }[]</code> | Web only need stripe-pwa-elements &gt; 1.1.0 |
| **`merchantIdentifier`**        | <code>string</code>                               | Web only need stripe-pwa-elements &gt; 1.1.0 |
| **`countryCode`**               | <code>string</code>                               | Web only need stripe-pwa-elements &gt; 1.1.0 |
| **`currency`**                  | <code>string</code>                               | Web only need stripe-pwa-elements &gt; 1.1.0 |


#### CreatePaymentFlowOption

| Prop                                        | Type                                                                                                    | Description                                                                                                                                                                                                             | Default                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret                                                                                                                         |                          |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret                                                                                                                         |                          |
| **`defaultBillingDetails`**                 | <code><a href="#defaultbillingdetails">DefaultBillingDetails</a></code>                                 | Optional defaultBillingDetails This is ios/android only. not support web. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details                          |                          |
| **`shippingDetails`**                       | <code><a href="#addressdetails">AddressDetails</a></code>                                               | Optional shippingDetails This is android only. ios requires an address element. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses                          |                          |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Optional billingDetailsCollectionConfiguration This is ios/android only. not support web. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection |                          |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Any documentation call 'ephemeralKey'                                                                                                                                                                                   |                          |
| **`customerId`**                            | <code>string</code>                                                                                     | Any documentation call 'customer'                                                                                                                                                                                       |                          |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | If you set payment method ApplePay, this set true                                                                                                                                                                       | <code>false</code>       |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | If set enableApplePay false, Plugin ignore here.                                                                                                                                                                        |                          |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | If you set payment method GooglePay, this set true                                                                                                                                                                      | <code>false</code>       |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    |                                                                                                                                                                                                                         | <code>false,</code>      |
| **`countryCode`**                           | <code>string</code>                                                                                     | use ApplePay and GooglePay. If set enableApplePay and enableGooglePay false, Plugin ignore here.                                                                                                                        | <code>"US"</code>        |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     |                                                                                                                                                                                                                         | <code>"App Name"</code>  |
| **`returnURL`**                             | <code>string</code>                                                                                     |                                                                                                                                                                                                                         | <code>""</code>          |
| **`paymentMethodLayout`**                   | <code>'automatic' \| 'horizontal' \| 'vertical'</code>                                                  |                                                                                                                                                                                                                         | <code>"automatic"</code> |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | iOS Only                                                                                                                                                                                                                | <code>undefined</code>   |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Platform: Web only Show ZIP code field.                                                                                                                                                                                 | <code>true</code>        |
| **`currencyCode`**                          | <code>string</code>                                                                                     | use GooglePay. Required if enableGooglePay is true for setupIntents.                                                                                                                                                    | <code>"USD"</code>       |


#### DefaultBillingDetails

| Prop          | Type                                        |
| ------------- | ------------------------------------------- |
| **`email`**   | <code>string</code>                         |
| **`name`**    | <code>string</code>                         |
| **`phone`**   | <code>string</code>                         |
| **`address`** | <code><a href="#address">Address</a></code> |


#### Address

| Prop             | Type                | Description                                   |
| ---------------- | ------------------- | --------------------------------------------- |
| **`country`**    | <code>string</code> | Two-letter country code (ISO 3166-1 alpha-2). |
| **`city`**       | <code>string</code> |                                               |
| **`line1`**      | <code>string</code> |                                               |
| **`line2`**      | <code>string</code> |                                               |
| **`postalCode`** | <code>string</code> |                                               |
| **`state`**      | <code>string</code> |                                               |


#### AddressDetails

| Prop                     | Type                                        |
| ------------------------ | ------------------------------------------- |
| **`name`**               | <code>string</code>                         |
| **`address`**            | <code><a href="#address">Address</a></code> |
| **`phone`**              | <code>string</code>                         |
| **`isCheckboxSelected`** | <code>boolean</code>                        |


#### BillingDetailsCollectionConfiguration

| Prop          | Type                                                                    | Description                                                          |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **`email`**   | <code><a href="#collectionmode">CollectionMode</a></code>               | Configuration for how billing details are collected during checkout. |
| **`name`**    | <code><a href="#collectionmode">CollectionMode</a></code>               |                                                                      |
| **`phone`**   | <code><a href="#collectionmode">CollectionMode</a></code>               |                                                                      |
| **`address`** | <code><a href="#addresscollectionmode">AddressCollectionMode</a></code> |                                                                      |


#### CreatePaymentSheetOption

| Prop                                        | Type                                                                                                    | Description                                                                                                                                                                                                             | Default                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret                                                                                                                         |                          |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret                                                                                                                         |                          |
| **`defaultBillingDetails`**                 | <code><a href="#defaultbillingdetails">DefaultBillingDetails</a></code>                                 | Optional defaultBillingDetails This is ios/android only. not support web. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details                          |                          |
| **`shippingDetails`**                       | <code><a href="#addressdetails">AddressDetails</a></code>                                               | Optional shippingDetails This is android only. ios requires an address element. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses                          |                          |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Optional billingDetailsCollectionConfiguration This is ios/android only. not support web. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection |                          |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Any documentation call 'ephemeralKey'                                                                                                                                                                                   |                          |
| **`customerId`**                            | <code>string</code>                                                                                     | Any documentation call 'customer'                                                                                                                                                                                       |                          |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | If you set payment method ApplePay, this set true                                                                                                                                                                       | <code>false</code>       |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | If set enableApplePay false, Plugin ignore here.                                                                                                                                                                        |                          |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | If you set payment method GooglePay, this set true                                                                                                                                                                      | <code>false</code>       |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    |                                                                                                                                                                                                                         | <code>false,</code>      |
| **`countryCode`**                           | <code>string</code>                                                                                     | use ApplePay and GooglePay. If set enableApplePay and enableGooglePay false, Plugin ignore here.                                                                                                                        | <code>"US"</code>        |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     |                                                                                                                                                                                                                         | <code>"App Name"</code>  |
| **`returnURL`**                             | <code>string</code>                                                                                     |                                                                                                                                                                                                                         | <code>""</code>          |
| **`paymentMethodLayout`**                   | <code>'automatic' \| 'horizontal' \| 'vertical'</code>                                                  |                                                                                                                                                                                                                         | <code>"automatic"</code> |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | iOS Only                                                                                                                                                                                                                | <code>undefined</code>   |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Platform: Web only Show ZIP code field.                                                                                                                                                                                 | <code>true</code>        |
| **`currencyCode`**                          | <code>string</code>                                                                                     | use GooglePay. Required if enableGooglePay is true for setupIntents.                                                                                                                                                    | <code>"USD"</code>       |


### Type Aliases


#### ApplePayResultInterface

<code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.DidSelectShippingContact</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.DidCreatePaymentMethod</a></code>


#### GooglePayResultInterface

<code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code>


#### CollectionMode

Billing details collection options.

<code>'automatic' | 'always' | 'never'</code>


#### AddressCollectionMode

Billing details collection options.

<code>'automatic' | 'full' | 'never'</code>


#### PaymentFlowResultInterface

<code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code>


#### PaymentSheetResultInterface

<code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code>


### Enums


#### ApplePayEventsEnum

| Members                        | Value                                           |
| ------------------------------ | ----------------------------------------------- |
| **`Loaded`**                   | <code>"applePayLoaded"</code>                   |
| **`FailedToLoad`**             | <code>"applePayFailedToLoad"</code>             |
| **`Completed`**                | <code>"applePayCompleted"</code>                |
| **`Canceled`**                 | <code>"applePayCanceled"</code>                 |
| **`Failed`**                   | <code>"applePayFailed"</code>                   |
| **`DidSelectShippingContact`** | <code>"applePayDidSelectShippingContact"</code> |
| **`DidCreatePaymentMethod`**   | <code>"applePayDidCreatePaymentMethod"</code>   |


#### GooglePayEventsEnum

| Members            | Value                                |
| ------------------ | ------------------------------------ |
| **`Loaded`**       | <code>"googlePayLoaded"</code>       |
| **`FailedToLoad`** | <code>"googlePayFailedToLoad"</code> |
| **`Completed`**    | <code>"googlePayCompleted"</code>    |
| **`Canceled`**     | <code>"googlePayCanceled"</code>     |
| **`Failed`**       | <code>"googlePayFailed"</code>       |


#### PaymentFlowEventsEnum

| Members            | Value                                  |
| ------------------ | -------------------------------------- |
| **`Loaded`**       | <code>"paymentFlowLoaded"</code>       |
| **`FailedToLoad`** | <code>"paymentFlowFailedToLoad"</code> |
| **`Opened`**       | <code>"paymentFlowOpened"</code>       |
| **`Created`**      | <code>"paymentFlowCreated"</code>      |
| **`Completed`**    | <code>"paymentFlowCompleted"</code>    |
| **`Canceled`**     | <code>"paymentFlowCanceled"</code>     |
| **`Failed`**       | <code>"paymentFlowFailed"</code>       |


#### PaymentSheetEventsEnum

| Members            | Value                                   |
| ------------------ | --------------------------------------- |
| **`Loaded`**       | <code>"paymentSheetLoaded"</code>       |
| **`FailedToLoad`** | <code>"paymentSheetFailedToLoad"</code> |
| **`Completed`**    | <code>"paymentSheetCompleted"</code>    |
| **`Canceled`**     | <code>"paymentSheetCanceled"</code>     |
| **`Failed`**       | <code>"paymentSheetFailed"</code>       |

</docgen-api>


## License

@capacitor-community/stripe is [MIT licensed](./LICENSE).
