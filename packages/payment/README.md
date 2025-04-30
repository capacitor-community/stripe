# @capacitor-community/stripe

Stripe Identity SDK bindings for Capacitor Applications

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

* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

This is for @capacitor/docgen only.
Not use in product.

### Interfaces


#### StripePlugin

| Method                   | Signature                                                                                                                                                                                                                                                                   | Description |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **initialize**           | (opts: <a href="#stripeinitializationoptions">StripeInitializationOptions</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                    |             |
| **handleURLCallback**    | (opts: <a href="#stripeurlhandlingoptions">StripeURLHandlingOptions</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                          | iOS Only    |
| **isApplePayAvailable**  | () =&gt; Promise&lt;void&gt;                                                                                                                                                                                                                                                |             |
| **createApplePay**       | (options: <a href="#createapplepayoption">CreateApplePayOption</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                               |             |
| **presentApplePay**      | () =&gt; Promise&lt;{ paymentResult: <a href="#applepayresultinterface">ApplePayResultInterface</a>; }&gt;                                                                                                                                                                  |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.Loaded</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                         |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.FailedToLoad</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                      |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.Completed</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                      |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.Canceled</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                       |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.Failed</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                            |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.DidSelectShippingContact</a>, listenerFunc: (data: <a href="#didselectshippingcontact">DidSelectShippingContact</a>) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt; |             |
| **addListener**          | (eventName: <a href="#applepayeventsenum">ApplePayEventsEnum.DidCreatePaymentMethod</a>, listenerFunc: (data: <a href="#didselectshippingcontact">DidSelectShippingContact</a>) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;   |             |
| **isGooglePayAvailable** | () =&gt; Promise&lt;void&gt;                                                                                                                                                                                                                                                |             |
| **createGooglePay**      | (options: <a href="#creategooglepayoption">CreateGooglePayOption</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                             |             |
| **presentGooglePay**     | () =&gt; Promise&lt;{ paymentResult: <a href="#googlepayresultinterface">GooglePayResultInterface</a>; }&gt;                                                                                                                                                                |             |
| **addListener**          | (eventName: <a href="#googlepayeventsenum">GooglePayEventsEnum.Loaded</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                       |             |
| **addListener**          | (eventName: <a href="#googlepayeventsenum">GooglePayEventsEnum.FailedToLoad</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                    |             |
| **addListener**          | (eventName: <a href="#googlepayeventsenum">GooglePayEventsEnum.Completed</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                    |             |
| **addListener**          | (eventName: <a href="#googlepayeventsenum">GooglePayEventsEnum.Canceled</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                     |             |
| **addListener**          | (eventName: <a href="#googlepayeventsenum">GooglePayEventsEnum.Failed</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                       |             |
| **createPaymentFlow**    | (options: <a href="#createpaymentflowoption">CreatePaymentFlowOption</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                         |             |
| **presentPaymentFlow**   | () =&gt; Promise&lt;{ cardNumber: string; }&gt;                                                                                                                                                                                                                             |             |
| **confirmPaymentFlow**   | () =&gt; Promise&lt;{ paymentResult: <a href="#paymentflowresultinterface">PaymentFlowResultInterface</a>; }&gt;                                                                                                                                                            |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Loaded</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                   |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.FailedToLoad</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Opened</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                   |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Completed</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Canceled</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                 |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Failed</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                      |             |
| **addListener**          | (eventName: <a href="#paymentfloweventsenum">PaymentFlowEventsEnum.Created</a>, listenerFunc: (info: { cardNumber: string; }) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                     |             |
| **createPaymentSheet**   | (options: <a href="#createpaymentsheetoption">CreatePaymentSheetOption</a>) =&gt; Promise&lt;void&gt;                                                                                                                                                                       |             |
| **presentPaymentSheet**  | () =&gt; Promise&lt;{ paymentResult: <a href="#paymentsheetresultinterface">PaymentSheetResultInterface</a>; }&gt;                                                                                                                                                          |             |
| **addListener**          | (eventName: <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Loaded</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                                 |             |
| **addListener**          | (eventName: <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.FailedToLoad</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                              |             |
| **addListener**          | (eventName: <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Completed</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                              |             |
| **addListener**          | (eventName: <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Canceled</a>, listenerFunc: () =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                               |             |
| **addListener**          | (eventName: <a href="#paymentsheeteventsenum">PaymentSheetEventsEnum.Failed</a>, listenerFunc: (error: string) =&gt; void) =&gt; Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;                                                                    |             |


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

| Prop                                        | Type                                                                                                    | Description                                                                                      | Default                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret  |                         |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret  |                         |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Optional billingDetailsCollectionConfiguration                                                   |                         |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Any documentation call 'ephemeralKey'                                                            |                         |
| **`customerId`**                            | <code>string</code>                                                                                     | Any documentation call 'customer'                                                                |                         |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | If you set payment method ApplePay, this set true                                                | <code>false</code>      |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | If set enableApplePay false, Plugin ignore here.                                                 |                         |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | If you set payment method GooglePay, this set true                                               | <code>false</code>      |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    |                                                                                                  | <code>false,</code>     |
| **`countryCode`**                           | <code>string</code>                                                                                     | use ApplePay and GooglePay. If set enableApplePay and enableGooglePay false, Plugin ignore here. | <code>"US"</code>       |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     |                                                                                                  | <code>"App Name"</code> |
| **`returnURL`**                             | <code>string</code>                                                                                     |                                                                                                  | <code>""</code>         |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | iOS Only                                                                                         | <code>undefined</code>  |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Platform: Web only Show ZIP code field.                                                          | <code>true</code>       |


#### BillingDetailsCollectionConfiguration

| Prop          | Type                                                                    | Description                                                          |
| ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **`email`**   | <code><a href="#collectionmode">CollectionMode</a></code>               | Configuration for how billing details are collected during checkout. |
| **`name`**    | <code><a href="#collectionmode">CollectionMode</a></code>               |                                                                      |
| **`phone`**   | <code><a href="#collectionmode">CollectionMode</a></code>               |                                                                      |
| **`address`** | <code><a href="#addresscollectionmode">AddressCollectionMode</a></code> |                                                                      |


#### CreatePaymentSheetOption

| Prop                                        | Type                                                                                                    | Description                                                                                      | Default                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| **`paymentIntentClientSecret`**             | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret  |                         |
| **`setupIntentClientSecret`**               | <code>string</code>                                                                                     | Any documentation call 'paymentIntent' Set paymentIntentClientSecret or setupIntentClientSecret  |                         |
| **`billingDetailsCollectionConfiguration`** | <code><a href="#billingdetailscollectionconfiguration">BillingDetailsCollectionConfiguration</a></code> | Optional billingDetailsCollectionConfiguration                                                   |                         |
| **`customerEphemeralKeySecret`**            | <code>string</code>                                                                                     | Any documentation call 'ephemeralKey'                                                            |                         |
| **`customerId`**                            | <code>string</code>                                                                                     | Any documentation call 'customer'                                                                |                         |
| **`enableApplePay`**                        | <code>boolean</code>                                                                                    | If you set payment method ApplePay, this set true                                                | <code>false</code>      |
| **`applePayMerchantId`**                    | <code>string</code>                                                                                     | If set enableApplePay false, Plugin ignore here.                                                 |                         |
| **`enableGooglePay`**                       | <code>boolean</code>                                                                                    | If you set payment method GooglePay, this set true                                               | <code>false</code>      |
| **`GooglePayIsTesting`**                    | <code>boolean</code>                                                                                    |                                                                                                  | <code>false,</code>     |
| **`countryCode`**                           | <code>string</code>                                                                                     | use ApplePay and GooglePay. If set enableApplePay and enableGooglePay false, Plugin ignore here. | <code>"US"</code>       |
| **`merchantDisplayName`**                   | <code>string</code>                                                                                     |                                                                                                  | <code>"App Name"</code> |
| **`returnURL`**                             | <code>string</code>                                                                                     |                                                                                                  | <code>""</code>         |
| **`style`**                                 | <code>'alwaysLight' \| 'alwaysDark'</code>                                                              | iOS Only                                                                                         | <code>undefined</code>  |
| **`withZipCode`**                           | <code>boolean</code>                                                                                    | Platform: Web only Show ZIP code field.                                                          | <code>true</code>       |


#### CapacitorStripeContext

| Prop                       | Type                                                  |
| -------------------------- | ----------------------------------------------------- |
| **`stripe`**               | <code><a href="#stripeplugin">StripePlugin</a></code> |
| **`isApplePayAvailable`**  | <code>boolean</code>                                  |
| **`isGooglePayAvailable`** | <code>boolean</code>                                  |


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

<code>'automatic' | 'full'</code>


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
