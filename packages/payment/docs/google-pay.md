---
title: "Google Pay"
code: [
  "/docs/stripe/google-pay/strings.xml.md",
  "/docs/stripe/google-pay/android-manifest.xml.md",
  "/docs/stripe/google-pay/google-pay.ts.md"
]
scrollActiveLine: [
  {id: "", activeLine: {}},
  {id: "strings.xml", activeLine: {['strings.xml']: [7, 14]}},
  {id: "androidmanifest.xml", activeLine: {['AndroidManifest.xml']: [36, 60]}},
  {id: "1.-isgooglepayavailable", activeLine: {['google-pay.ts']: [4, 10]}},
  {id: "2.-creategooglepay", activeLine: {['google-pay.ts']: [15, 33]}},
  {id: "3.-presentgooglepay", activeLine: {['google-pay.ts']: [33, 39]}},
  {id: "4.-addlistener", activeLine: {['google-pay.ts']: [11, 14]}}
]
---

Google Pay confirms a PaymentIntent in one presentation. The Android implementation also accepts a SetupIntent; the web implementation does not.

https://stripe.com/docs/google-pay

On web, Google Pay uses the Payment Request Button. Serve the app over HTTPS in development and production.

https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites

## Platform support

| Platform | Google Pay |
| --- | --- |
| Android | Native `GooglePayLauncher` (requires app metadata) |
| iOS | Not implemented |
| Web | Payment Request Button (`stripe-pwa-elements`) |

iOS rejects `isGooglePayAvailable`, `createGooglePay`, and `presentGooglePay`. Android reads Google Pay configuration from metadata when the plugin loads, so `initialize` alone is not enough on Android.

## Prepare settings

### strings.xml

In `android/app/src/main/res/values/strings.xml` add:

- `publishable_key` (Stripe publishable key)
- `enable_google_pay`
- `country_code`
- `merchant_display_name`
- `google_pay_is_testing`

```xml
<string name="publishable_key">Your Publishable Key</string>
<bool name="enable_google_pay">true</bool>
<string name="country_code">US</string>
<string name="merchant_display_name">Widget Store</string>
<bool name="google_pay_is_testing">true</bool>
```

Optional Stripe Connect on Android Google Pay:

```xml
<string name="stripe_account">acct_xxxxxxxxxxxxx</string>
```

### AndroidManifest.xml

In `android/app/src/main/AndroidManifest.xml`, add the following under `manifest > application`:

```xml
<meta-data
  android:name="com.google.android.gms.wallet.api.enabled"
  android:value="true" />

<meta-data
  android:name="com.getcapacitor.community.stripe.enable_google_pay"
  android:value="@bool/enable_google_pay"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.publishable_key"
  android:value="@string/publishable_key"/>

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

Optional connected account:

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.stripe_account"
  android:value="@string/stripe_account"/>
```

#### Optional1: If you get user information, set these:

```xml
<bool name="email_address_required">true</bool>
<bool name="phone_number_required">true</bool>
<bool name="billing_address_required">true</bool>
<string name="billing_address_format">Full</string>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.email_address_required"
  android:value="@bool/email_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.phone_number_required"
  android:value="@bool/phone_number_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_required"
  android:value="@bool/billing_address_required"/>

<meta-data
  android:name="com.getcapacitor.community.stripe.billing_address_format"
  android:value="@string/billing_address_format"/>
```

#### Optional2: If you don't require existing payment method at Google Pay:

If false, Google Pay is considered ready even if the customer's Google Pay wallet does not have existing payment methods. Defaults to true.

```xml
<bool name="google_pay_existing_payment_method_required">false</bool>
```

```xml
<meta-data
  android:name="com.getcapacitor.community.stripe.google_pay_existing_payment_method_required"
  android:value="@bool/google_pay_existing_payment_method_required"/>
```

## 1. isGooglePayAvailable

The promise resolves when Google Pay is ready and rejects otherwise.

```ts
import { GooglePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isGooglePayAvailable();
} catch {
  return;
}
```

!::isGooglePayAvailable::

## 2. createGooglePay

Fetch a PaymentIntent client secret from your backend. On Android, you may instead pass a SetupIntent client secret. See [Server Integration](./server-integration.md). The option is named `paymentIntentClientSecret` for both Intent types. Web also needs `paymentSummaryItems`, `merchantIdentifier`, `countryCode`, and `currency`.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createGooglePay({
  paymentIntentClientSecret: paymentIntent,

  // Web only. Google Pay on Android App doesn't need
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

!::createGooglePay::

!::CreateGooglePayOption::

:::message
`paymentSummaryItems`, `merchantIdentifier`, `countryCode`, and `currency` are required on web. Android uses the metadata country and merchant name instead.
:::

A SetupIntent client secret starts with `seti_`. Android detects that prefix and uses `presentForSetupIntent` with `currency` from the create options (default `USD`). Do not pass a SetupIntent on web: the web implementation confirms with `confirmCardPayment`.

## 3. presentGooglePay

```ts
const result = await Stripe.presentGooglePay();
if (result.paymentResult === GooglePayEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

!::presentGooglePay::

!::GooglePayResultInterface::

Treat `Canceled` as cancellation and `Failed` as an error. Prefer result listeners after Android Activity recreation. See [Event Listeners](./learn/event-listeners.md).

## 4. addListener

```ts
Stripe.addListener(GooglePayEventsEnum.Completed, () => {
  console.log('GooglePayEventsEnum.Completed');
});
```

!::GooglePayEventsEnum::

## Reference

- [Google Pay (Android)](https://stripe.com/docs/google-pay)
- [Google Pay (Web)](https://stripe.com/docs/stripe-js/elements/payment-request-button?platform=html-js-testing-google-pay#html-js-prerequisites)
