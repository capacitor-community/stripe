<p align="center"><br><img src="https://user-images.githubusercontent.com/236501/85893648-1c92e880-b7a8-11ea-926d-95355b8175c7.png" width="128" height="128" /></p>
<h3 align="center">Stripe</h3>
<p align="center"><strong><code>@capacitor-community/stripe</code></strong></p>
<p align="center">
  Capacitor community plugin for native Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/maintenance/yes/2021?style=flat-square" />
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/l/@capacitor-community/stripe?style=flat-square" /></a>
<br>
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/dw/@capacitor-community/stripe?style=flat-square" /></a>
  <a href="https://www.npmjs.com/package/@capacitor-community/stripe"><img src="https://img.shields.io/npm/v/@capacitor-community/stripe?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors-"><img src="https://img.shields.io/badge/all%20contributors-0-orange?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
</p>

## Maintainers

| Maintainer          | GitHub                              | Social                                | Sponsoring Company                             |
| ------------------- | ----------------------------------- | ------------------------------------- | ---------------------------------------------- |
| Ibby Hadeed | [ihadeed](https://github.com/ihadeed) | |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) | RELATION DESIGN LABO, GENERAL INC. ASSOCIATION |

## Demo

[Demo code is here.](https://github.com/capacitor-community/stripe/tree/master/demo)

### Screenshots

|  |  PaymentSheet  |  PaymentFlow  |
| :---: | :---: | :---: |
|  Android  | ![](demo/screenshots/payment-sheet-android.png)  | ![](demo/screenshots/payment-flow-android.png) |
|  iOS  | ![](demo/screenshots/payment-sheet-ios.png)  | ![](demo/screenshots/payment-flow-ios.png) |
|  Web  | ![](demo/screenshots/payment-sheet-web.png) | Coming soon |

## Install

```bash
npm install @capacitor-community/stripe
npx cap sync
```

__This plugin is not compatible with v1. All APIs have been revamped.__

### Android configuration

In file `android/app/src/main/java/**/**/MainActivity.java`, add the plugin to the initialization list:

```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(com.getcapacitor.community.stripe.StripePlugin.class);
    }
}
```

### iOS configuration

not need.


### Web configuration

__This feature is experimental. Please tested and feedback. If you want to contribute UI, Animation or create issue, move to https://github.com/stripe-elements/stripe-elements .__

```bash
npm install @stripe-elements/stripe-elements
```

And defineCustomElements() called once during the bootstrapping of your application.

```ts
import { defineCustomElements } from '@stripe-elements/stripe-elements/loader';
defineCustomElements();
```

@stripe-elements/stripe-elements is created with StencilJS. If you can't understand where defined, please check https://stenciljs.com/docs/angular/

## Example

### Initialize Stripe

```ts
import { Stripe } from '@capacitor-community/stripe';

export async function initialize(): Promise<void> {
  Stripe.initialize({
    publishableKey: "Your Publishable Key""",
  });
}
```


### PaymentSheet

With PaymentSheet, you can make instant payments in a single flow.

#### createPaymentSheet

You should connect to your backend endpoint, and get every key. This is "not" function at this Plugin. So you can use `HTTPClient` , `Axios` , `Ajax` , and so on.
Backend structure is here: https://stripe.com/docs/payments/accept-a-payment?platform=ios#add-server-endpoint

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

export async function createPaymentSheet(): Promise<void> {
  /**
   * Connect to your backend endpoint, and get every key.
   */
  const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);
  
  Stripe.createPaymentSheet({
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    // merchantDisplayName: 'Your App Name or Company Name',
    // customerEphemeralKeySecret: ephemeralKey,
    // style: 'alwaysDark',
  });
}
```

#### presentPaymentSheet

present in `PaymentSheet` is single flow. You don't need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentPaymentSheet();
}
```


### PaymentFlow

With PaymentFlow, you can make payments in two steps flow. And you can use setupIntent.

#### createPaymentFlow

You should connect to your backend endpoint, and get every key. This is "not" function at this Plugin. So you can use `HTTPClient` , `Axios` , `Ajax` , and so on.
Backend structure is here: https://stripe.com/docs/payments/accept-a-payment?platform=ios#add-server-endpoint

You will need to prepare either paymentIntentClientSecret or setupIntentClientSecret and set it in the method.

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

export async function create(): Promise<void> {
  /**
   * Connect to your backend endpoint, and get every key.
   */
  const { paymentIntent, ephemeralKey, customer } = await this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);
  
  Stripe.createPaymentFlow({
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    // setupIntentClientSecret: setupIntent,
    // merchantDisplayName: 'Your App Name or Company Name',
    // customerEphemeralKeySecret: ephemeralKey,
    // style: 'alwaysDark',
  });
}
```

#### presentPaymentFlow

present in `presentPaymentFlow` is not submit method. You need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentPaymentFlow();
  console.log(result); // { cardNumber: "●●●● ●●●● ●●●● ****" }
}
```

#### confirmPaymentFlow

```ts
export async function present(): Promise<void> {
  const result = await Stripe.confirmPaymentFlow();
}
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`createPaymentFlow(...)`](#createpaymentflow)
* [`presentPaymentFlow()`](#presentpaymentflow)
* [`confirmPaymentFlow()`](#confirmpaymentflow)
* [`addListener(PaymentFlowEventsEnum.Loaded, ...)`](#addlistenerpaymentfloweventsenumloaded-)
* [`addListener(PaymentFlowEventsEnum.FailedToLoad, ...)`](#addlistenerpaymentfloweventsenumfailedtoload-)
* [`addListener(PaymentFlowEventsEnum.Opened, ...)`](#addlistenerpaymentfloweventsenumopened-)
* [`addListener(PaymentFlowEventsEnum.FailedToLoad, ...)`](#addlistenerpaymentfloweventsenumfailedtoload-)
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
addListener(eventName: PaymentFlowEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                           |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.Opened, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Opened, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Opened</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                           |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                        |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Failed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentFlowEventsEnum.Created, ...)

```typescript
addListener(eventName: PaymentFlowEventsEnum.Created, listenerFunc: (info: { cardNumber: string; }) => void) => PluginListenerHandle
```

| Param              | Type                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Created</a></code> |
| **`listenerFunc`** | <code>(info: { cardNumber: string; }) =&gt; void</code>                         |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

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


### addListener(PaymentSheetEventsEnum.Completed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                          |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.Canceled, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                         |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(PaymentSheetEventsEnum.Failed, ...)

```typescript
addListener(eventName: PaymentSheetEventsEnum.Failed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### Interfaces


#### StripeInitializationOptions

| Prop                 | Type                |
| -------------------- | ------------------- |
| **`publishableKey`** | <code>string</code> |
| **`stripeAccount`**  | <code>string</code> |


#### CreatePaymentFlowOption

| Prop                            | Type                | Description                                                                                     |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code> | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret |
| **`setupIntentClientSecret`**   | <code>string</code> | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### CreatePaymentSheetOption

| Prop                            | Type                | Description                            |
| ------------------------------- | ------------------- | -------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code> | Any documentation call 'paymentIntent' |


### Type Aliases


#### PaymentFlowResultInterface

<code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code>


#### PaymentSheetResultInterface

<code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code>


### Enums


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
