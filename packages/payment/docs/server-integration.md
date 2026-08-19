---
title: "Server Integration"
code: []
scrollActiveLine: []
---

`@capacitor-community/stripe` only accepts client-safe values. Your backend creates PaymentIntents, SetupIntents, Customers, and ephemeral keys with the Stripe secret key. The plugin never calls the secret API.

## Secret-key confinement

Keep `sk_live_...` and `sk_test_...` on the server. Ship only the publishable key to the app, through `Stripe.initialize` or Android Google Pay metadata. Do not embed the secret key in Capacitor config, source control, or client logs.

## Client secrets

Create a [PaymentIntent](https://stripe.com/docs/payments/payment-intents) to charge now, or a [SetupIntent](https://stripe.com/docs/payments/save-and-reuse) to save a method for later. Return the Intent **client secret** to the app, not the secret key and not a raw charge.

Customer ephemeral keys are optional. Use them with a Customer id when PaymentSheet or PaymentFlow should show saved methods. If you pass `customerId` to the plugin, you must also pass `customerEphemeralKeySecret`. A PaymentIntent without a Customer is valid.

Map server fields to plugin options:

| Server field | Plugin option |
| --- | --- |
| `paymentIntent` | `paymentIntentClientSecret` |
| `setupIntent` | `setupIntentClientSecret` |
| `ephemeralKey` | `customerEphemeralKeySecret` |
| `customer` | `customerId` |

## Response shapes

PaymentIntent with a Customer:

```json
{
  "paymentIntent": "pi_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

SetupIntent with a Customer:

```json
{
  "setupIntent": "seti_..._secret_...",
  "ephemeralKey": "ek_...",
  "customer": "cus_..."
}
```

PaymentIntent without a Customer:

```json
{
  "paymentIntent": "pi_..._secret_..."
}
```

Apple Pay uses a PaymentIntent client secret. Google Pay uses a PaymentIntent client secret on web; Android also accepts a SetupIntent client secret through the historically named `paymentIntentClientSecret` option. Native PaymentSheet and PaymentFlow accept either Intent secret, with or without Customer fields. The current web PaymentSheet accepts PaymentIntents only; web PaymentFlow accepts either Intent type.

## Webhook authority

`Completed` on the device is a UI signal. It is not proof that Stripe captured funds. Fulfill orders from verified [Stripe webhooks](https://docs.stripe.com/webhooks) such as `payment_intent.succeeded` or `setup_intent.succeeded`.

Treat `Canceled` as the customer dismissing the sheet. Treat `Failed` and `FailedToLoad` as errors. Retry only after you create a new Intent when the previous one can no longer be confirmed.

The official demo server that returns the shapes above is [capacitor-community/stripe/demo/server](https://github.com/capacitor-community/stripe/tree/main/demo/server).
