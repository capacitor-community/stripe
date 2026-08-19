---
title: "Initialize to your project"
code: []
scrollActiveLine: []
---

Import `Stripe` and call `initialize` with a [publishable key](https://dashboard.stripe.com/apikeys). Do this once per JavaScript runtime, before you create or present any payment UI.

```ts
import { Stripe } from '@capacitor-community/stripe';

export async function initialize(): Promise<void> {
  await Stripe.initialize({
    publishableKey: 'Your Publishable Key',
  });
}
```

<!-- !::initialize:: -->

<!-- !::StripeInitializationOptions:: -->

Create a publishable key in the [Stripe Dashboard](https://dashboard.stripe.com/register). Never ship the secret key to the client.

## Stripe Connect

Set optional `stripeAccount` to make plugin API calls for a [connected account](https://stripe.com/docs/connect/authentication).

```ts
await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
  stripeAccount: 'acct_xxxxxxxxxxxxx',
});
```

On Android, Google Pay can also read `com.getcapacitor.community.stripe.stripe_account` from application metadata. See [Google Pay](./google-pay.md).

## Redirect-based payment methods on iOS

Payment methods that leave your app for authentication, such as PayPal and some bank payment methods, need a return URL. On iOS, Stripe may omit these payment methods from PaymentSheet or PaymentFlow when `returnURL` is not configured.

Register a custom URL scheme for your app in `ios/App/App/Info.plist`. Replace `your-app` with a scheme unique to your application:

```xml plist:ios/App/App/Info.plist
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>your-app</string>
    </array>
  </dict>
</array>
```

Pass a URL using that scheme to `createPaymentSheet` or `createPaymentFlow`, then forward matching app-open events to Stripe:

```ts
import { App } from '@capacitor/app';
import { Stripe } from '@capacitor-community/stripe';

const STRIPE_RETURN_URL = 'your-app://stripe-redirect';

await App.addListener('appUrlOpen', async ({ url }) => {
  if (url.startsWith(STRIPE_RETURN_URL)) {
    await Stripe.handleURLCallback({ url });
  }
});

await Stripe.createPaymentSheet({
  paymentIntentClientSecret,
  returnURL: STRIPE_RETURN_URL,
});
```

Use the same setup with `createPaymentFlow`. The custom scheme in `Info.plist`, the scheme in `returnURL`, and the URL checked by the listener must match. Payment-method availability also depends on the Intent, currency, country, Stripe account, Dashboard settings, and Stripe SDK support.

### handleURLCallback

`handleURLCallback` is iOS only. It passes the incoming return URL to the Stripe SDK so redirect-based authentication can finish and the browser can close.

<!-- !::handleURLCallback:: -->

<!-- !::StripeURLHandlingOptions:: -->

The method is not implemented on Android or web. Only pass matching Stripe return URLs to it. If Stripe does not handle the URL, the promise rejects and you should continue with your normal deep-link handling.

## Example

### Angular

Initialize from the root component. See [Angular](./angular.md).

```ts:src/app/app.component.ts
import { Component } from '@angular/core';
import { Stripe } from '@capacitor-community/stripe';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    void Stripe.initialize({
      publishableKey: 'Your Publishable Key',
    });
  }
}
```

### React

`CapacitorStripeProvider` initializes the plugin for you. See [React](./react.md).
