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
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) | RELATION DESIGN LABO, GENERAL INC. ASSOCIATION |
| Ibby Hadeed | [ihadeed](https://github.com/ihadeed) | |

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


### Present Payment Sheet

#### create

You should connect to your backend endpoint, and get every key. This is "not" function at this Plugin. So you can use HTTPClient, Axios, Ajax, and so on.

Backend structure is here: https://stripe.com/docs/payments/accept-a-payment?platform=ios#add-server-endpoint

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
  
  Stripe.createPaymentSheet({
    paymentIntentClientSecret: paymentIntent,
    customerEphemeralKeySecret: ephemeralKey,
    customerId: customer,
    merchantDisplayName: 'Your App Name or Company Name',
    // style: 'alwaysDark',
  });
}
```

### present

```ts
export async function present(): Promise<void> {
  Stripe.presentPaymentSheet();
}
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
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
presentPaymentSheet() => Promise<{ paymentResult: PaymentSheetResult; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#paymentsheetresult">PaymentSheetResult</a>; }&gt;</code>

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


#### CreatePaymentSheetOption

| Prop                             | Type                                       | Description                                                                                |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **`paymentIntentClientSecret`**  | <code>string</code>                        | Any documentation call 'paymentIntent'                                                     |
| **`customerEphemeralKeySecret`** | <code>string</code>                        | Any documentation call 'ephemeralKey'                                                      |
| **`customerId`**                 | <code>string</code>                        | Any documentation call 'customer'                                                          |
| **`useApplePay`**                | <code>boolean</code>                       | If you set payment method ApplePay, this set true                                          |
| **`applePayMerchantId`**         | <code>string</code>                        | If set useApplePay false, Plugin ignore here.                                              |
| **`useGooglePay`**               | <code>boolean</code>                       | If you set payment method GooglePay, this set true                                         |
| **`GooglePayIsTesting`**         | <code>boolean</code>                       |                                                                                            |
| **`countryCode`**                | <code>string</code>                        | use ApplePay and GooglePay. If set useApplePay and useGooglePay false, Plugin ignore here. |
| **`merchantDisplayName`**        | <code>string</code>                        |                                                                                            |
| **`style`**                      | <code>'alwaysLight' \| 'alwaysDark'</code> | iOS Only                                                                                   |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### PaymentSheetResult

<code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code>


### Enums


#### PaymentSheetEventsEnum

| Members            | Value                                   |
| ------------------ | --------------------------------------- |
| **`Loaded`**       | <code>"paymentSheetLoaded"</code>       |
| **`FailedToLoad`** | <code>"paymentSheetFailedToLoad"</code> |
| **`Completed`**    | <code>"paymentSheetCompleted"</code>    |
| **`Canceled`**     | <code>"paymentSheetCanceled"</code>     |
| **`Failed`**       | <code>"paymentSheetFailed"</code>       |

</docgen-api>
