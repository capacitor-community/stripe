---
title: "Vanilla JS Quick start"
code: []
scrollActiveLine: []
---

Web uses `stripe-pwa-elements` custom elements. Install the peer dependency and register the elements once during bootstrap, before you present Stripe UI.

```bash
npm install stripe-pwa-elements
```

```ts
import { defineCustomElements } from 'stripe-pwa-elements/loader';
import { Stripe } from '@capacitor-community/stripe';

defineCustomElements();

await Stripe.initialize({
  publishableKey: 'Your Publishable Key',
});
```

`stripe-pwa-elements` is a Stencil library. If you need the loader details, see the [Stencil documentation](https://stenciljs.com/docs/overview).

Web PaymentSheet and PaymentFlow render a card modal, not the native Stripe PaymentSheet. Apple Pay and Google Pay use the Payment Request Button and require HTTPS. Many native-only options such as `defaultBillingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, and `enableGooglePay` are ignored on web.
