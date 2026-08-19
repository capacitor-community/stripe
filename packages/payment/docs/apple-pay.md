---
title: "ApplePay"
code: ["/docs/stripe/apple-pay/apple-pay.ts.md"]
scrollActiveLine: [
{id: "", activeLine: {}},
{id: "1.-isapplepayavailable", activeLine: {['apple-pay.ts']: [4, 10]}},
{id: "2.-createapplepay", activeLine: {['apple-pay.ts']: [15, 31]}},
{id: "3.-presentapplepay", activeLine: {['apple-pay.ts']: [31, 37]}},
{id: "4.-addlistener", activeLine: {['apple-pay.ts']: [11, 14]}}
]
---

Apple Pay confirms a PaymentIntent in one presentation.

https://stripe.com/docs/apple-pay

[![Image from Gyazo](https://i.gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99.gif)](https://gyazo.com/d632147e6d3b33dcc8e28f3ecc898a99)

## Platform support

| Platform | Apple Pay |
| --- | --- |
| iOS | Native `STPApplePayContext` |
| Android | Not implemented |
| Web | Payment Request Button (`stripe-pwa-elements`) |

`updateApplePaySheet` and shipping contact updates run on iOS only. Web throws unimplemented for `updateApplePaySheet`. Android rejects `isApplePayAvailable`, `createApplePay`, and `presentApplePay`.

## Prepare settings

- Register an Apple Merchant ID
- Create an Apple Pay certificate
- Enable Apple Pay in Xcode

https://stripe.com/docs/apple-pay#merchantid

`createApplePay` `merchantIdentifier` must be the same merchant ID registered in the [Apple Developer](https://developer.apple.com/account/resources/identifiers/add/merchant) account and Xcode. Do not pass `merchantDisplayName` here; that option belongs to PaymentSheet and PaymentFlow.

## 1. isApplePayAvailable

Check the device before you create a request. The promise resolves when Apple Pay is available and rejects otherwise.

```ts
import { ApplePayEventsEnum, Stripe } from '@capacitor-community/stripe';

try {
  await Stripe.isApplePayAvailable();
} catch {
  return;
}
```

<!-- !::isApplePayAvailable:: -->

## 2. createApplePay

Fetch a PaymentIntent client secret from your backend. See [Server Integration](./server-integration.md). Then pass `paymentIntentClientSecret`, `paymentSummaryItems`, `merchantIdentifier`, `countryCode`, and `currency`.

```ts
import { firstValueFrom } from 'rxjs';

const { paymentIntent } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createApplePay({
  paymentIntentClientSecret: paymentIntent,
  paymentSummaryItems: [{
    label: 'Product Name',
    amount: 1099.00
  }],
  merchantIdentifier: 'merchant.com.getcapacitor.stripe',
  countryCode: 'US',
  currency: 'USD',
});
```

<!-- !::createApplePay:: -->

<!-- !::CreateApplePayOption:: -->

`requiredShippingContactFields` asks Apple Pay for postal address, phone, email, or name. `allowedCountries` rejects shipping countries that are not in the list.

## 3. presentApplePay

```ts
const result = await Stripe.presentApplePay();
if (result.paymentResult === ApplePayEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

<!-- !::presentApplePay:: -->

<!-- !::ApplePayResultInterface:: -->

Treat `Canceled` as cancellation and `Failed` as an error.

## 4. addListener

Register listeners at application startup. See [Event Listeners](./learn/event-listeners.md).

```ts
Stripe.addListener(ApplePayEventsEnum.Completed, () => {
  console.log('ApplePayEventsEnum.Completed');
});
```

<!-- !::ApplePayEventsEnum:: -->

## 5. updateApplePaySheet

On iOS, `DidSelectShippingContact` includes `contact` and `updateId`. Recalculate totals and call `updateApplePaySheet` with that `updateId`. If JavaScript does not respond, the native sheet falls back to the original summary items after 25 seconds.

```ts
Stripe.addListener(ApplePayEventsEnum.DidSelectShippingContact, async (data) => {
  await Stripe.updateApplePaySheet({
    updateId: data.updateId,
    paymentSummaryItems: [
      { label: 'Product Name', amount: 1099.00 },
      { label: 'Shipping', amount: 500.00 },
      { label: 'Total', amount: 1599.00 },
    ],
  });
});
```

<!-- !::updateApplePaySheet:: -->

<!-- !::DidSelectShippingContact:: -->

<!-- !::PaymentSummaryItem:: -->

`DidCreatePaymentMethod` includes the shipping contact after Apple creates the payment method. Apple does not return the full address until a successful payment.

<!-- !::DidCreatePaymentMethod:: -->

<!-- !::ShippingContact:: -->

## Reference

- [Apple Pay (iOS)](https://stripe.com/docs/apple-pay)
- [Merchant name on the Apple Pay sheet](https://github.com/capacitor-community/stripe/issues/115)
