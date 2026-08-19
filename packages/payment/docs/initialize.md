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

## handleURLCallback

`handleURLCallback` is iOS only. Use it with `returnURL` on PaymentSheet or PaymentFlow so Stripe can finish [3D Secure](https://stripe.com/docs/payments/3d-secure#return-url) after the customer returns from the bank page.

```ts
await Stripe.createPaymentSheet({
  paymentIntentClientSecret,
  returnURL: 'your-app://stripe-redirect',
});

// Call from the iOS URL open handler with the returned URL.
await Stripe.handleURLCallback({ url });
```

<!-- !::handleURLCallback:: -->

<!-- !::StripeURLHandlingOptions:: -->

The method is not implemented on Android or web. If Stripe did not handle the URL, the promise rejects and you should continue with your normal deep-link handling.

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
