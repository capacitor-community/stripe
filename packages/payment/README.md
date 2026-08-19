# @capacitor-community/stripe

Stripe SDK bindings for Capacitor Applications

<!-- rdlabo-docs-omit -->
**Documentation:** [Read the full documentation](https://docs.rdlabo.dev/projects/capacitor-stripe)
<!-- /rdlabo-docs-omit -->

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

## Usage

See [Configuration](./docs/configuration.md) to install the plugin, then [PaymentSheet](./docs/payment-sheet.md), [PaymentFlow](./docs/payment-flow.md), [Apple Pay](./docs/apple-pay.md), and [Google Pay](./docs/google-pay.md).

<!-- rdlabo-docs-omit -->
## How to use

The API reference below and the repository's [demo applications](https://github.com/capacitor-community/stripe/tree/main/demo) track the current plugin version.

### Recommended result handling

Use result events as the default result path. Register application-level result listeners once per JavaScript application startup, as early as possible during bootstrap—for example, from `main.ts`, an application initializer, or a singleton service initialized at startup—and before presenting Stripe UI.

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => handleCompleted()),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => handleCanceled()),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => handleFailed(error)),
]);

await Stripe.presentPaymentSheet();
```

### Android activity recreation

This is especially important on Android, where the Activity and JavaScript runtime can be recreated while Stripe's UI is open. The new JavaScript runtime must register its listeners during bootstrap.

The original JavaScript Promise and Capacitor `PluginCall` cannot be restored. If Stripe delivers the native result after recreation, the plugin retains the corresponding result event until a listener is available. This applies to the `Completed`, `Canceled`, and `Failed` events for PaymentSheet, PaymentFlow, and Google Pay, and to the `Created` event for PaymentFlow.

If the original call still exists, behavior is unchanged: the Promise is settled normally and the event is delivered without being retained. This fallback is an in-memory handoff of a native result; it is not persistent storage and does not guarantee recovery after OS process death.

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`handleURLCallback(...)`](#handleurlcallback)
* [`isApplePayAvailable()`](#isapplepayavailable)
* [`createApplePay(...)`](#createapplepay)
* [`presentApplePay()`](#presentapplepay)
* [`updateApplePaySheet(...)`](#updateapplepaysheet)
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

Configures the Stripe SDK. Call this once before using any payment method.

| Param      | Type                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#stripeinitializationoptions">StripeInitializationOptions</a></code> |

**Since:** 3.0.0

--------------------


### handleURLCallback(...)

```typescript
handleURLCallback(opts: StripeURLHandlingOptions) => Promise<void>
```

Passes an incoming return URL back to the Stripe SDK after redirect-based
authentication.

iOS only. Call this from your app URL handler when Stripe redirects back
to the application. Configure the same custom URL scheme as `returnURL`
when creating PaymentSheet or PaymentFlow.

| Param      | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| **`opts`** | <code><a href="#stripeurlhandlingoptions">StripeURLHandlingOptions</a></code> |

**Since:** 4.0.0

--------------------


### isApplePayAvailable()

```typescript
isApplePayAvailable() => Promise<void>
```

Resolves when Apple Pay is available and rejects when it is unavailable.
Apple Pay is supported on iOS and compatible web browsers, not Android.

**Since:** 3.1.0

--------------------


### createApplePay(...)

```typescript
createApplePay(options: CreateApplePayOption) => Promise<void>
```

Creates an Apple Pay request. Call this before `presentApplePay()`.

| Param         | Type                                                                  |
| ------------- | --------------------------------------------------------------------- |
| **`options`** | <code><a href="#createapplepayoption">CreateApplePayOption</a></code> |

**Since:** 3.1.0

--------------------


### presentApplePay()

```typescript
presentApplePay() => Promise<{ paymentResult: ApplePayResultInterface; }>
```

Presents the Apple Pay request created by `createApplePay()`.

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#applepayresultinterface">ApplePayResultInterface</a>; }&gt;</code>

**Since:** 3.1.0

--------------------


### updateApplePaySheet(...)

```typescript
updateApplePaySheet(options: UpdateApplePaySheetOption) => Promise<void>
```

Updates the native Apple Pay sheet after a shipping-contact callback.
iOS only; this method is not supported on web.

| Param         | Type                                                                            |
| ------------- | ------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#updateapplepaysheetoption">UpdateApplePaySheetOption</a></code> |

**Since:** 8.2.0

--------------------


### addListener(ApplePayEventsEnum.Loaded, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the Apple Pay request is ready to present.

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.1.0

--------------------


### addListener(ApplePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when the Apple Pay request could not be created.

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.1.0

--------------------


### addListener(ApplePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after Apple Pay completes successfully.

| Param              | Type                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.1.0

--------------------


### addListener(ApplePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the customer cancels Apple Pay.

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.1.0

--------------------


### addListener(ApplePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when Apple Pay fails.

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                  |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.1.0

--------------------


### addListener(ApplePayEventsEnum.DidSelectShippingContact, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.DidSelectShippingContact, listenerFunc: (data: DidSelectShippingContact) => void) => Promise<PluginListenerHandle>
```

iOS only. Emitted when the customer selects a shipping contact. Use the
supplied `updateId` with `updateApplePaySheet()`.

| Param              | Type                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.DidSelectShippingContact</a></code>       |
| **`listenerFunc`** | <code>(data: <a href="#didselectshippingcontact">DidSelectShippingContact</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 4.1.0

--------------------


### addListener(ApplePayEventsEnum.DidCreatePaymentMethod, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.DidCreatePaymentMethod, listenerFunc: (data: DidCreatePaymentMethod) => void) => Promise<PluginListenerHandle>
```

iOS only. Emitted after Apple Pay creates its Stripe PaymentMethod.

| Param              | Type                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.DidCreatePaymentMethod</a></code>     |
| **`listenerFunc`** | <code>(data: <a href="#didcreatepaymentmethod">DidCreatePaymentMethod</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 4.1.0

--------------------


### isGooglePayAvailable()

```typescript
isGooglePayAvailable() => Promise<void>
```

Resolves when Google Pay is available and rejects when it is unavailable.
Google Pay is supported on Android and compatible web browsers, not iOS.

**Since:** 3.2.0

--------------------


### createGooglePay(...)

```typescript
createGooglePay(options: CreateGooglePayOption) => Promise<void>
```

Creates a Google Pay request. Call this before `presentGooglePay()`.

| Param         | Type                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| **`options`** | <code><a href="#creategooglepayoption">CreateGooglePayOption</a></code> |

**Since:** 3.2.0

--------------------


### presentGooglePay()

```typescript
presentGooglePay() => Promise<{ paymentResult: GooglePayResultInterface; }>
```

Presents the Google Pay request created by `createGooglePay()`.

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#googlepayresultinterface">GooglePayResultInterface</a>; }&gt;</code>

**Since:** 3.2.0

--------------------


### addListener(GooglePayEventsEnum.Loaded, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the Google Pay request is ready to present.

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.2.0

--------------------


### addListener(GooglePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when the Google Pay request could not be created.

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.2.0

--------------------


### addListener(GooglePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after Google Pay completes successfully.

| Param              | Type                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                    |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.2.0

--------------------


### addListener(GooglePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the customer cancels Google Pay.

| Param              | Type                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.2.0

--------------------


### addListener(GooglePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Failed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when Google Pay fails.

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.2.0

--------------------


### createPaymentFlow(...)

```typescript
createPaymentFlow(options: CreatePaymentFlowOption) => Promise<void>
```

Creates a PaymentFlow instance. Use PaymentFlow when the app must collect
payment details first and confirm them in a later step.

| Param         | Type                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **`options`** | <code><a href="#createpaymentflowoption">CreatePaymentFlowOption</a></code> |

**Since:** 3.0.2

--------------------


### presentPaymentFlow()

```typescript
presentPaymentFlow() => Promise<{ cardNumber: string; }>
```

Presents the PaymentFlow created by `createPaymentFlow()` and resolves
with the last four digits of the selected card.

**Returns:** <code>Promise&lt;{ cardNumber: string; }&gt;</code>

**Since:** 3.0.2

--------------------


### confirmPaymentFlow()

```typescript
confirmPaymentFlow() => Promise<{ paymentResult: PaymentFlowResultInterface; }>
```

Confirms the payment details collected by `presentPaymentFlow()`.

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#paymentflowresultinterface">PaymentFlowResultInterface</a>; }&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Loaded, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentFlow has been created and is ready to present.

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentFlow could not be created.

| Param              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                              |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Opened, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Opened, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the PaymentFlow UI is presented.

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after the collected payment details are confirmed.

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the customer dismisses PaymentFlow.

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentFlow collection or confirmation fails.

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                        |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### addListener(PaymentFlowEventsEnum.Created, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Created, listenerFunc: (info: { cardNumber: string; }) => void) => Promise<PluginListenerHandle>
```

Emitted after payment details are collected and before confirmation. The
card number contains only the last four digits.

| Param              | Type                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Created</a></code> |
| **`listenerFunc`** | <code>(info: { cardNumber: string; }) =&gt; void</code>                         |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.2

--------------------


### createPaymentSheet(...)

```typescript
createPaymentSheet(options: CreatePaymentSheetOption) => Promise<void>
```

Creates and configures a PaymentSheet instance. Wait for this Promise or
the `Loaded` event before calling `presentPaymentSheet()`.

| Param         | Type                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| **`options`** | <code><a href="#createpaymentsheetoption">CreatePaymentSheetOption</a></code> |

**Since:** 3.0.0

--------------------


### presentPaymentSheet()

```typescript
presentPaymentSheet() => Promise<{ paymentResult: PaymentSheetResultInterface; }>
```

Presents the PaymentSheet created by `createPaymentSheet()` and resolves
with its completed, canceled, or failed result.

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#paymentsheetresultinterface">PaymentSheetResultInterface</a>; }&gt;</code>

**Since:** 3.0.0

--------------------


### addListener(PaymentSheetEventsEnum.Loaded, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Loaded, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentSheet has been created and is ready to present.

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.0

--------------------


### addListener(PaymentSheetEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.FailedToLoad, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentSheet could not be created.

| Param              | Type                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                                |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.0

--------------------


### addListener(PaymentSheetEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Completed, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted after the customer completes PaymentSheet.

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.0

--------------------


### addListener(PaymentSheetEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Canceled, listenerFunc: () => void) => Promise<PluginListenerHandle>
```

Emitted when the customer dismisses PaymentSheet.

| Param              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                         |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.0

--------------------


### addListener(PaymentSheetEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Failed, listenerFunc: (error: string) => void) => Promise<PluginListenerHandle>
```

Emitted when PaymentSheet finishes with an error.

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>(error: string) =&gt; void</code>                                          |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 3.0.0

--------------------


### Interfaces


#### StripeInitializationOptions

| Prop                 | Type                | Description                                                                                                                        | Since |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`publishableKey`** | <code>string</code> | Stripe publishable key for the account that creates the client-side payment UI. Never pass a secret key to the client application. | 3.0.0 |
| **`stripeAccount`**  | <code>string</code> | Connected account ID used when making client-side calls on behalf of a Stripe Connect account.                                     | 3.0.0 |


#### StripeURLHandlingOptions

| Prop      | Type                | Description                                    | Since |
| --------- | ------------------- | ---------------------------------------------- | ----- |
| **`url`** | <code>string</code> | Full callback URL received by the application. | 4.0.0 |


#### CreateApplePayOption

| Prop                                   | Type                                                                          | Description                                                                | Since |
| -------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----- |
| **`paymentIntentClientSecret`**        | <code>string</code>                                                           | Client secret of the PaymentIntent to confirm with Apple Pay.              | 3.1.0 |
| **`paymentSummaryItems`**              | <code>PaymentSummaryItem[]</code>                                             | Line items displayed in the Apple Pay sheet.                               | 3.1.0 |
| **`merchantIdentifier`**               | <code>string</code>                                                           | Apple merchant identifier configured for the app.                          | 3.1.0 |
| **`countryCode`**                      | <code>string</code>                                                           | Two-letter ISO 3166-1 country code for the payment request.                | 3.1.0 |
| **`currency`**                         | <code>string</code>                                                           | Three-letter ISO 4217 currency code for the payment request.               | 3.1.0 |
| **`requiredShippingContactFields`**    | <code>('postalAddress' \| 'phoneNumber' \| 'emailAddress' \| 'name')[]</code> | Shipping contact fields Apple Pay must collect. iOS only.                  | 4.1.0 |
| **`allowedCountries`**                 | <code>string[]</code>                                                         | Two-letter country codes accepted for shipping. iOS only.                  | 5.4.3 |
| **`allowedCountriesErrorDescription`** | <code>string</code>                                                           | Message shown when the selected shipping country is not allowed. iOS only. | 5.4.3 |


#### PaymentSummaryItem

| Prop         | Type                | Description                                                       | Since |
| ------------ | ------------------- | ----------------------------------------------------------------- | ----- |
| **`label`**  | <code>string</code> | Label shown for the line item in the Apple Pay sheet.             | 3.1.0 |
| **`amount`** | <code>number</code> | Decimal amount in the currency's major unit, for example `10.99`. | 3.1.0 |


#### UpdateApplePaySheetOption

| Prop                      | Type                              | Description                                                                                            | Since |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| **`updateId`**            | <code>string</code>               | Identifier received from the <a href="#didselectshippingcontact">`DidSelectShippingContact`</a> event. | 8.2.0 |
| **`paymentSummaryItems`** | <code>PaymentSummaryItem[]</code> | Replacement line items to display in the Apple Pay sheet.                                              | 8.2.0 |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### DidSelectShippingContact

Apple Pay shipping-contact data.

| Prop           | Type                                                        | Description                                                     | Since |
| -------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | ----- |
| **`contact`**  | <code><a href="#shippingcontact">ShippingContact</a></code> | Shipping contact selected in Apple Pay.                         | 4.1.0 |
| **`updateId`** | <code>string</code>                                         | Identifier passed to `updateApplePaySheet()` for this callback. | 4.1.0 |


#### ShippingContact

| Prop                        | Type                | Description                                                                  | Since |
| --------------------------- | ------------------- | ---------------------------------------------------------------------------- | ----- |
| **`givenName`**             | <code>string</code> | Contact's given name. Apple Pay only.                                        | 4.1.0 |
| **`familyName`**            | <code>string</code> | Contact's family name. Apple Pay only.                                       | 4.1.0 |
| **`middleName`**            | <code>string</code> | Contact's middle name. Apple Pay only.                                       | 4.1.0 |
| **`namePrefix`**            | <code>string</code> | Contact's name prefix. Apple Pay only.                                       | 4.1.0 |
| **`nameSuffix`**            | <code>string</code> | Contact's name suffix. Apple Pay only.                                       | 4.1.0 |
| **`nameFormatted`**         | <code>string</code> | Contact's formatted full name. Apple Pay only.                               | 4.1.0 |
| **`phoneNumber`**           | <code>string</code> | Contact's phone number. Apple Pay only.                                      | 4.1.0 |
| **`nickname`**              | <code>string</code> | Contact's nickname. Apple Pay only.                                          | 4.1.0 |
| **`street`**                | <code>string</code> | Street component of the contact's postal address. Apple Pay only.            | 4.1.0 |
| **`city`**                  | <code>string</code> | City component of the contact's postal address. Apple Pay only.              | 4.1.0 |
| **`state`**                 | <code>string</code> | State or province component of the contact's postal address. Apple Pay only. | 4.1.0 |
| **`postalCode`**            | <code>string</code> | Postal-code component of the contact's address. Apple Pay only.              | 4.1.0 |
| **`country`**               | <code>string</code> | Country or region name in the contact's address. Apple Pay only.             | 4.1.0 |
| **`isoCountryCode`**        | <code>string</code> | ISO country code in the contact's address. Apple Pay only.                   | 4.1.0 |
| **`subAdministrativeArea`** | <code>string</code> | Sub-administrative area in the contact's address. Apple Pay only.            | 4.1.0 |
| **`subLocality`**           | <code>string</code> | Sublocality in the contact's address. Apple Pay only.                        | 4.1.0 |


#### DidCreatePaymentMethod

| Prop          | Type                                                        | Description                                       | Since |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------- | ----- |
| **`contact`** | <code><a href="#shippingcontact">ShippingContact</a></code> | Contact attached to the Apple Pay payment method. | 4.1.0 |


#### CreateGooglePayOption

| Prop                            | Type                                              | Description                                                    | Since |
| ------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- | ----- |
| **`paymentIntentClientSecret`** | <code>string</code>                               | Client secret of the PaymentIntent to confirm with Google Pay. | 3.2.0 |
| **`paymentSummaryItems`**       | <code>{ label: string; amount: number; }[]</code> | Web only. Requires stripe-pwa-elements ^3.0.0.                 | 3.2.0 |
| **`merchantIdentifier`**        | <code>string</code>                               | Web only. Requires stripe-pwa-elements ^3.0.0.                 | 3.2.0 |
| **`countryCode`**               | <code>string</code>                               | Web only. Requires stripe-pwa-elements ^3.0.0.                 | 3.2.0 |
| **`currency`**                  | <code>string</code>                               | Web only. Requires stripe-pwa-elements ^3.0.0.                 | 3.2.0 |


#### CreatePaymentFlowOption

| Prop                                        | Type                                                                                                    | Description                                                                                                                                                                                                                                      | Default                  | Since |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----- |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Client secret of the PaymentIntent to confirm. Provide exactly one of `paymentIntentClientSecret` or `setupIntentClientSecret`.                                                                                                                  |                          | 3.0.2 |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Client secret of the SetupIntent used to save a payment method. Provide exactly one of `paymentIntentClientSecret` or `setupIntentClientSecret`.                                                                                                 |                          | 3.0.2 |
| **`defaultBillingDetails`**                 | <code><a href="#defaultbillingdetails">DefaultBillingDetails</a></code>                                 | Billing details used to prefill PaymentSheet. iOS and Android only. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details                                                         |                          | 7.2.0 |
| **`shippingDetails`**                       | <code><a href="#addressdetails">AddressDetails</a></code>                                               | Shipping details used to prefill PaymentSheet. Android only; on iOS use Stripe's address element instead. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses                         |                          | 7.2.0 |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Controls which billing details PaymentSheet collects. iOS and Android only. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection                                        |                          | 7.2.0 |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Customer ephemeral-key secret returned by your server. Use together with `customerId`; do not provide only one of the pair.                                                                                                                      |                          | 3.0.0 |
| **`customerId`**                            | <code>string</code>                                                                                     | Stripe Customer ID associated with `customerEphemeralKeySecret`.                                                                                                                                                                                 |                          | 3.0.0 |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | Enables Apple Pay in native PaymentSheet. iOS only.                                                                                                                                                                                              | <code>false</code>       | 3.3.0 |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | Apple merchant identifier configured for the app. Required when `enableApplePay` is true and ignored otherwise.                                                                                                                                  |                          | 3.3.0 |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | Enables Google Pay in native PaymentSheet. Android only.                                                                                                                                                                                         | <code>false</code>       | 3.2.0 |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    | Uses the Google Pay test environment. Android only.                                                                                                                                                                                              | <code>false</code>       | 3.2.0 |
| **`countryCode`**                           | <code>string</code>                                                                                     | Two-letter ISO 3166-1 country code used by Apple Pay or Google Pay. Ignored when neither wallet is enabled.                                                                                                                                      | <code>"US"</code>        | 3.2.0 |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     | Merchant name displayed in native PaymentSheet.                                                                                                                                                                                                  | <code>"App Name"</code>  | 3.0.0 |
| **`returnURL`**                             | <code>string</code>                                                                                     | Custom URL scheme used to return to the app after redirect-based authentication. iOS only. Stripe may omit redirect-based payment methods when this is not configured. Forward the returned URL to `handleURLCallback` from the app URL handler. | <code>""</code>          | 3.0.0 |
| **`paymentMethodLayout`**                   | <code>'automatic' \| 'horizontal' \| 'vertical'</code>                                                  | Layout used to display payment methods in PaymentSheet on iOS and Android.                                                                                                                                                                       | <code>"automatic"</code> | 7.2.2 |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | Appearance override for native PaymentSheet. iOS only.                                                                                                                                                                                           | <code>undefined</code>   | 3.0.0 |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Shows the ZIP-code field in the web card form. Web only.                                                                                                                                                                                         | <code>true</code>        | 3.6.0 |
| **`currencyCode`**                          | <code>string</code>                                                                                     | Three-letter ISO 4217 currency code used by Google Pay. Required when Google Pay is enabled for a SetupIntent.                                                                                                                                   | <code>"USD"</code>       | 7.1.0 |


#### DefaultBillingDetails

| Prop          | Type                                        | Description                      | Since |
| ------------- | ------------------------------------------- | -------------------------------- | ----- |
| **`email`**   | <code>string</code>                         | Prefilled billing email address. | 7.2.0 |
| **`name`**    | <code>string</code>                         | Prefilled billing name.          | 7.2.0 |
| **`phone`**   | <code>string</code>                         | Prefilled billing phone number.  | 7.2.0 |
| **`address`** | <code><a href="#address">Address</a></code> | Prefilled billing address.       | 7.2.0 |


#### Address

| Prop             | Type                | Description                                                        | Since |
| ---------------- | ------------------- | ------------------------------------------------------------------ | ----- |
| **`country`**    | <code>string</code> | Two-letter country code (ISO 3166-1 alpha-2).                      | 7.2.0 |
| **`city`**       | <code>string</code> | City, district, suburb, town, or village.                          | 7.2.0 |
| **`line1`**      | <code>string</code> | Primary address line, such as a street address or post office box. | 7.2.0 |
| **`line2`**      | <code>string</code> | Secondary address line, such as an apartment or suite.             | 7.2.0 |
| **`postalCode`** | <code>string</code> | ZIP or postal code.                                                | 7.2.0 |
| **`state`**      | <code>string</code> | State, county, province, or region.                                | 7.2.0 |


#### AddressDetails

| Prop                     | Type                                        | Description                                                            | Since |
| ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------- | ----- |
| **`name`**               | <code>string</code>                         | Recipient name.                                                        | 7.2.0 |
| **`address`**            | <code><a href="#address">Address</a></code> | Recipient postal address.                                              | 7.2.0 |
| **`phone`**              | <code>string</code>                         | Recipient phone number.                                                | 7.2.0 |
| **`isCheckboxSelected`** | <code>boolean</code>                        | Whether the customer selected the save-address checkbox. Android only. | 7.2.0 |


#### BillingDetailsCollectionConfiguration

Controls which billing details PaymentSheet collects from the customer.

| Prop          | Type                                                                    | Description                     | Since |
| ------------- | ----------------------------------------------------------------------- | ------------------------------- | ----- |
| **`email`**   | <code><a href="#collectionmode">CollectionMode</a></code>               | Email collection mode.          | 5.4.0 |
| **`name`**    | <code><a href="#collectionmode">CollectionMode</a></code>               | Name collection mode.           | 5.4.0 |
| **`phone`**   | <code><a href="#collectionmode">CollectionMode</a></code>               | Phone-number collection mode.   | 5.4.0 |
| **`address`** | <code><a href="#addresscollectionmode">AddressCollectionMode</a></code> | Postal-address collection mode. | 5.4.0 |


#### CreatePaymentSheetOption

| Prop                                        | Type                                                                                                    | Description                                                                                                                                                                                                                                      | Default                  | Since |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ----- |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Client secret of the PaymentIntent to confirm. Provide exactly one of `paymentIntentClientSecret` or `setupIntentClientSecret`.                                                                                                                  |                          | 3.0.0 |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Client secret of the SetupIntent used to save a payment method. Provide exactly one of `paymentIntentClientSecret` or `setupIntentClientSecret`.                                                                                                 |                          | 3.0.0 |
| **`defaultBillingDetails`**                 | <code><a href="#defaultbillingdetails">DefaultBillingDetails</a></code>                                 | Billing details used to prefill PaymentSheet. iOS and Android only. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details                                                         |                          | 7.2.0 |
| **`shippingDetails`**                       | <code><a href="#addressdetails">AddressDetails</a></code>                                               | Shipping details used to prefill PaymentSheet. Android only; on iOS use Stripe's address element instead. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses                         |                          | 7.2.0 |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Controls which billing details PaymentSheet collects. iOS and Android only. https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection                                        |                          | 7.2.0 |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Customer ephemeral-key secret returned by your server. Use together with `customerId`; do not provide only one of the pair.                                                                                                                      |                          | 3.0.0 |
| **`customerId`**                            | <code>string</code>                                                                                     | Stripe Customer ID associated with `customerEphemeralKeySecret`.                                                                                                                                                                                 |                          | 3.0.0 |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | Enables Apple Pay in native PaymentSheet. iOS only.                                                                                                                                                                                              | <code>false</code>       | 3.3.0 |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | Apple merchant identifier configured for the app. Required when `enableApplePay` is true and ignored otherwise.                                                                                                                                  |                          | 3.3.0 |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | Enables Google Pay in native PaymentSheet. Android only.                                                                                                                                                                                         | <code>false</code>       | 3.2.0 |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    | Uses the Google Pay test environment. Android only.                                                                                                                                                                                              | <code>false</code>       | 3.2.0 |
| **`countryCode`**                           | <code>string</code>                                                                                     | Two-letter ISO 3166-1 country code used by Apple Pay or Google Pay. Ignored when neither wallet is enabled.                                                                                                                                      | <code>"US"</code>        | 3.2.0 |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     | Merchant name displayed in native PaymentSheet.                                                                                                                                                                                                  | <code>"App Name"</code>  | 3.0.0 |
| **`returnURL`**                             | <code>string</code>                                                                                     | Custom URL scheme used to return to the app after redirect-based authentication. iOS only. Stripe may omit redirect-based payment methods when this is not configured. Forward the returned URL to `handleURLCallback` from the app URL handler. | <code>""</code>          | 3.0.0 |
| **`paymentMethodLayout`**                   | <code>'automatic' \| 'horizontal' \| 'vertical'</code>                                                  | Layout used to display payment methods in PaymentSheet on iOS and Android.                                                                                                                                                                       | <code>"automatic"</code> | 7.2.2 |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | Appearance override for native PaymentSheet. iOS only.                                                                                                                                                                                           | <code>undefined</code>   | 3.0.0 |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Shows the ZIP-code field in the web card form. Web only.                                                                                                                                                                                         | <code>true</code>        | 3.6.0 |
| **`currencyCode`**                          | <code>string</code>                                                                                     | Three-letter ISO 4217 currency code used by Google Pay. Required when Google Pay is enabled for a SetupIntent.                                                                                                                                   | <code>"USD"</code>       | 7.1.0 |


### Type Aliases


#### ApplePayResultInterface

Final result returned after presenting Apple Pay.

<code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.DidSelectShippingContact</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.DidCreatePaymentMethod</a></code>


#### GooglePayResultInterface

Final result returned after presenting Google Pay.

<code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code>


#### CollectionMode

Billing details collection options.

<code>'automatic' | 'always' | 'never'</code>


#### AddressCollectionMode

Billing details collection options.

<code>'automatic' | 'full' | 'never'</code>


#### PaymentFlowResultInterface

Final result returned after confirming PaymentFlow.

<code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code>


#### PaymentSheetResultInterface

Final result returned after presenting PaymentSheet.

<code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code>


### Enums


#### ApplePayEventsEnum

| Members                        | Value                                           |
| ------------------------------ | ----------------------------------------------- |
| **`Loaded`**                   | <code>'applePayLoaded'</code>                   |
| **`FailedToLoad`**             | <code>'applePayFailedToLoad'</code>             |
| **`Completed`**                | <code>'applePayCompleted'</code>                |
| **`Canceled`**                 | <code>'applePayCanceled'</code>                 |
| **`Failed`**                   | <code>'applePayFailed'</code>                   |
| **`DidSelectShippingContact`** | <code>'applePayDidSelectShippingContact'</code> |
| **`DidCreatePaymentMethod`**   | <code>'applePayDidCreatePaymentMethod'</code>   |


#### GooglePayEventsEnum

| Members            | Value                                |
| ------------------ | ------------------------------------ |
| **`Loaded`**       | <code>'googlePayLoaded'</code>       |
| **`FailedToLoad`** | <code>'googlePayFailedToLoad'</code> |
| **`Completed`**    | <code>'googlePayCompleted'</code>    |
| **`Canceled`**     | <code>'googlePayCanceled'</code>     |
| **`Failed`**       | <code>'googlePayFailed'</code>       |


#### PaymentFlowEventsEnum

| Members            | Value                                  |
| ------------------ | -------------------------------------- |
| **`Loaded`**       | <code>'paymentFlowLoaded'</code>       |
| **`FailedToLoad`** | <code>'paymentFlowFailedToLoad'</code> |
| **`Opened`**       | <code>'paymentFlowOpened'</code>       |
| **`Created`**      | <code>'paymentFlowCreated'</code>      |
| **`Completed`**    | <code>'paymentFlowCompleted'</code>    |
| **`Canceled`**     | <code>'paymentFlowCanceled'</code>     |
| **`Failed`**       | <code>'paymentFlowFailed'</code>       |


#### PaymentSheetEventsEnum

| Members            | Value                                   |
| ------------------ | --------------------------------------- |
| **`Loaded`**       | <code>'paymentSheetLoaded'</code>       |
| **`FailedToLoad`** | <code>'paymentSheetFailedToLoad'</code> |
| **`Completed`**    | <code>'paymentSheetCompleted'</code>    |
| **`Canceled`**     | <code>'paymentSheetCanceled'</code>     |
| **`Failed`**       | <code>'paymentSheetFailed'</code>       |

</docgen-api>


## License

@capacitor-community/stripe is [MIT licensed](../../LICENSE).
<!-- /rdlabo-docs-omit -->
