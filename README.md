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
</p>

## Maintainers

| Maintainer          | GitHub                              | Social                                | Sponsoring Company                             |
| ------------------- | ----------------------------------- | ------------------------------------- | ---------------------------------------------- |
| Hidetaka Okamoto | [hideokamoto](https://github.com/hideokamoto) | [@hide__dev](https://twitter.com/hide__dev) |  |
| Ibby Hadeed | [ihadeed](https://github.com/ihadeed) | |
| Masahiko Sakakibara | [rdlabo](https://github.com/rdlabo) | [@rdlabo](https://twitter.com/rdlabo) | RELATION DESIGN LABO, GENERAL INC. ASSOCIATION |

## Contributors ✨
<a href="https://github.com/capacitor-community/stripe/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=capacitor-community/stripe" />
</a>

Made with [contributors-img](https://contrib.rocks).

## Demo

- [Demo code is here](https://github.com/capacitor-community/stripe/tree/master/demo). Please check these code before ask at issues.
- Demo of Web is [hosting here.](https://capacitor-community-stripe.netlify.app/).

### Screenshots

|  |  Android  |  iOS  |  Web  |
| :---: | :---: | :---: | :---: |
|  PaymentSheet  | ![](demo/screenshots/payment-sheet-android.png)  | ![](demo/screenshots/payment-sheet-ios.png)  | ![](demo/screenshots/payment-sheet-web.png) |
|  PaymentFlow   | ![](demo/screenshots/payment-flow-android.png) |  ![](demo/screenshots/payment-flow-ios.png) | Coming soon |
|  ApplePay   | Not support |  ![](demo/screenshots/apple-pay-ios.png) | Coming soon |
|  GooglePay   |  ![](demo/screenshots/google-pay-android.png) | Not support | Coming soon |

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

### 1. Initialize Stripe

```ts
import { Stripe } from '@capacitor-community/stripe';

export async function initialize(): Promise<void> {
  Stripe.initialize({
    publishableKey: "Your Publishable Key",
  });
}
```


### 2. PaymentSheet

With PaymentSheet, you can make instant payments in a single flow.

#### 2.1. createPaymentSheet

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

#### 2.2. presentPaymentSheet

present in `PaymentSheet` is single flow. You don't need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentPaymentSheet();
}
```


### 3. PaymentFlow

With PaymentFlow, you can make payments in two steps flow. And you can use setupIntent.

#### 3.1.  createPaymentFlow

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

#### 3.2. presentPaymentFlow

present in `presentPaymentFlow` is not submit method. You need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentPaymentFlow();
  console.log(result); // { cardNumber: "●●●● ●●●● ●●●● ****" }
}
```

#### 3.3. confirmPaymentFlow

```ts
export async function present(): Promise<void> {
  const result = await Stripe.confirmPaymentFlow();
}
```

### 3. Apple Pay

With Apple Pay, you can make instant payments in a single flow. Please check settings: https://stripe.com/docs/apple-pay#merchantid

#### 3.1. createApplePay

You should connect to your backend endpoint, and get every key. This is "not" function at this Plugin. So you can use `HTTPClient` , `Axios` , `Ajax` , and so on.
Backend structure is here: https://stripe.com/docs/payments/accept-a-payment?platform=ios#add-server-endpoint

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

export async function createApplePay(): Promise<void> {
  /**
   * Connect to your backend endpoint, and get every key.
   */
  const { paymentIntent } = await this.http.post<{
    paymentIntent: string;
  }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

  await Stripe.createApplePay({
    paymentIntentClientSecret: paymentIntent,
    paymentSummaryItems: [{
      label: 'Product Name',
      amount: 1099.00
    }],
    merchantDisplayName: 'rdlabo',
    countryCode: 'US',
    currency: 'USD',
  });
}
```

#### 3.2. presentApplePay

present in `createApplePay` is single flow. You don't need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentApplePay();
}
```


### 4. Google Pay

With Google Pay, you can make instant payments in a single flow. Please check settings: https://stripe.com/docs/google-pay
And in Android App, you need some settings.

In file android/app/src/main/res/values/strings.xml add the following lines :
```xml
<string name="publishable_key">Your Publishable Key</string>
<bool name="enable_google_pay">true</bool>
<string name="country_code">US</string>
<string name="merchant_display_name">Widget Store</string>
<bool name="google_pay_is_testing">true</bool>
```

In file android/app/src/main/AndroidManifest.xml, add the following XML elements under <manifest><application> :
```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.publishable_key"
  android:value="@string/publishable_key"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.enable_google_pay"
  android:value="@bool/enable_google_pay"/>

<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />

<meta-data
  android:name="com.getcapacitor.community.stripe.country_code"
  android:value="@string/country_code"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.merchant_display_name"
  android:value="@string/merchant_display_name"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_is_testing"
  android:value="@bool/google_pay_is_testing"/>
```

#### 4.1. createGooglePay

You should connect to your backend endpoint, and get every key. This is "not" function at this Plugin. So you can use `HTTPClient` , `Axios` , `Ajax` , and so on.
Backend structure is here: https://stripe.com/docs/payments/accept-a-payment?platform=android#add-server-endpoint

```ts
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

export async function createGooglePay(): Promise<void> {
  /**
   * Connect to your backend endpoint, and get every key.
   */
  const { paymentIntent } = await this.http.post<{
    paymentIntent: string;
  }>(environment.api + 'payment-sheet', {}).pipe(first()).toPromise(Promise);

  await Stripe.createGooglePay({
    paymentIntentClientSecret: paymentIntent,
  });
}
```

#### 4.2. presentGooglePay

present in `createGooglePay` is single flow. You don't need to confirm method.

```ts
export async function present(): Promise<void> {
  const result = await Stripe.presentApplePay();
}
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`isApplePayAvailable()`](#isapplepayavailable)
* [`createApplePay(...)`](#createapplepay)
* [`presentApplePay()`](#presentapplepay)
* [`addListener(ApplePayEventsEnum.Loaded, ...)`](#addlistenerapplepayeventsenumloaded-)
* [`addListener(ApplePayEventsEnum.FailedToLoad, ...)`](#addlistenerapplepayeventsenumfailedtoload-)
* [`addListener(ApplePayEventsEnum.FailedToLoad, ...)`](#addlistenerapplepayeventsenumfailedtoload-)
* [`addListener(ApplePayEventsEnum.Completed, ...)`](#addlistenerapplepayeventsenumcompleted-)
* [`addListener(ApplePayEventsEnum.Canceled, ...)`](#addlistenerapplepayeventsenumcanceled-)
* [`addListener(ApplePayEventsEnum.Failed, ...)`](#addlistenerapplepayeventsenumfailed-)
* [`isGooglePayAvailable()`](#isgooglepayavailable)
* [`createGooglePay(...)`](#creategooglepay)
* [`presentGooglePay()`](#presentgooglepay)
* [`addListener(GooglePayEventsEnum.Loaded, ...)`](#addlistenergooglepayeventsenumloaded-)
* [`addListener(GooglePayEventsEnum.FailedToLoad, ...)`](#addlistenergooglepayeventsenumfailedtoload-)
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
presentApplePay() => Promise<{ paymentResult: ApplePayResultInterface; data?: any; }>
```

**Returns:** <code>Promise&lt;{ paymentResult: <a href="#applepayresultinterface">ApplePayResultInterface</a>; data?: any; }&gt;</code>

--------------------


### addListener(ApplePayEventsEnum.Loaded, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(ApplePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(ApplePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                           |
| ------------------ | ------------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                     |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(ApplePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                  |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(ApplePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(ApplePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: ApplePayEventsEnum.Failed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **`eventName`**    | <code><a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                               |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

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
addListener(eventName: GooglePayEventsEnum.Loaded, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Loaded</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(GooglePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(GooglePayEventsEnum.FailedToLoad, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.FailedToLoad, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.FailedToLoad</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                       |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(GooglePayEventsEnum.Completed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Completed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                    |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(GooglePayEventsEnum.Canceled, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Canceled, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                   |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### addListener(GooglePayEventsEnum.Failed, ...)

```typescript
addListener(eventName: GooglePayEventsEnum.Failed, listenerFunc: () => void) => PluginListenerHandle
```

| Param              | Type                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **`eventName`**    | <code><a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code> |
| **`listenerFunc`** | <code>() =&gt; void</code>                                                 |

**Returns:** <code><a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

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


#### CreateApplePayOption

| Prop                            | Type                                              |
| ------------------------------- | ------------------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code>                               |
| **`paymentSummaryItems`**       | <code>{ label: string; amount: number; }[]</code> |
| **`merchantIdentifier`**        | <code>string</code>                               |
| **`countryCode`**               | <code>string</code>                               |
| **`currency`**                  | <code>string</code>                               |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### CreateGooglePayOption

| Prop                            | Type                |
| ------------------------------- | ------------------- |
| **`paymentIntentClientSecret`** | <code>string</code> |


#### CreatePaymentFlowOption

| Prop                            | Type                | Description                                                                                     |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code> | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret |
| **`setupIntentClientSecret`**   | <code>string</code> | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret |


#### CreatePaymentSheetOption

| Prop                            | Type                | Description                            |
| ------------------------------- | ------------------- | -------------------------------------- |
| **`paymentIntentClientSecret`** | <code>string</code> | Any documentation call 'paymentIntent' |


### Type Aliases


#### ApplePayResultInterface

<code><a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a> | <a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a></code>


#### GooglePayResultInterface

<code><a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a> | <a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a></code>


#### PaymentFlowResultInterface

<code><a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a> | <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a></code>


#### PaymentSheetResultInterface

<code><a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a> | <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a></code>


### Enums


#### ApplePayEventsEnum

| Members            | Value                               |
| ------------------ | ----------------------------------- |
| **`Loaded`**       | <code>"applePayLoaded"</code>       |
| **`FailedToLoad`** | <code>"applePayFailedToLoad"</code> |
| **`Completed`**    | <code>"applePayCompleted"</code>    |
| **`Canceled`**     | <code>"applePayCanceled"</code>     |
| **`Failed`**       | <code>"applePayFailed"</code>       |


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
