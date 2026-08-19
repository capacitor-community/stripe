---
title: "PaymentFlow"
code: ["/docs/stripe/payment-flow/payment-flow.ts.md"]
scrollActiveLine: [
  {id: "", activeLine: {}},
  {id: "1.-createpaymentflow", activeLine: {['payment-flow.ts']: [9, 23]}},
  {id: "2.-presentpaymentflow", activeLine: {['payment-flow.ts']: [23, 27]}},
  {id: "3.-confirmpaymentflow", activeLine: {['payment-flow.ts']: [27, 33]}},
  {id: "4.-addlistener", activeLine: {['payment-flow.ts']: [4, 8]}}
]
---

PaymentFlow splits collection and confirmation. `presentPaymentFlow` collects the payment method and returns a pending card. `confirmPaymentFlow` confirms the Intent later, usually after a review screen.

[![Image from Gyazo](https://i.gyazo.com/736450bb2e267eab0bba578e366fcba5.gif)](https://gyazo.com/736450bb2e267eab0bba578e366fcba5)

Use a [PaymentIntent](https://stripe.com/docs/payments/payment-intents) or a [SetupIntent](https://stripe.com/docs/payments/save-and-reuse?platform=web). Create those objects on your server. See [Server Integration](./server-integration.md).

## Platform support

| Platform | PaymentFlow |
| --- | --- |
| iOS | Native PaymentSheet.FlowController |
| Android | Native PaymentSheet.FlowController |
| Web | `stripe-pwa-elements` card modal |

Web supports `paymentIntentClientSecret` or `setupIntentClientSecret`, plus optional `withZipCode`. Native-only options such as `defaultBillingDetails`, `shippingDetails`, `billingDetailsCollectionConfiguration`, `enableApplePay`, `enableGooglePay`, `style`, and `returnURL` are ignored on web.

## 1. createPaymentFlow

Fetch client-safe secrets from your backend, then call `createPaymentFlow`. Provide **either** `paymentIntentClientSecret` **or** `setupIntentClientSecret`. `customerId` and `customerEphemeralKeySecret` are optional together. If you set `customerId`, you must also set `customerEphemeralKeySecret`.

```ts
import { firstValueFrom } from 'rxjs';
import { PaymentFlowEventsEnum, Stripe } from '@capacitor-community/stripe';

const { paymentIntent, ephemeralKey, customer } = await firstValueFrom(
  this.http.post<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }>(environment.api + 'intent', {}),
);

await Stripe.createPaymentFlow({
  paymentIntentClientSecret: paymentIntent,
  customerEphemeralKeySecret: ephemeralKey,
  customerId: customer,
  merchantDisplayName: 'rdlabo',
});
```

<!-- !::createPaymentFlow:: -->

<!-- !::CreatePaymentFlowOption:: -->

On iOS, configure `returnURL` and `handleURLCallback` for PayPal, 3D Secure, and other redirect-based payment methods; Stripe may omit those methods when no return URL is available. See [Redirect-based payment methods on iOS](./initialize.md#redirect-based-payment-methods-on-ios).

## 2. presentPaymentFlow

Call `presentPaymentFlow` only after `createPaymentFlow` succeeds. The returned `cardNumber` is a masked value. The Intent is not confirmed yet.

```ts
const presentResult = await Stripe.presentPaymentFlow();
console.log(presentResult); // { cardNumber: "●●●● ●●●● ●●●● ****" }
```

<!-- !::presentPaymentFlow:: -->

If the customer cancels, the promise rejects or the `Canceled` event fires. Do not call `confirmPaymentFlow` until `Created` or a successful `presentPaymentFlow` result.

## 3. confirmPaymentFlow

```ts
const confirmResult = await Stripe.confirmPaymentFlow();
if (confirmResult.paymentResult === PaymentFlowEventsEnum.Completed) {
  // Update UI only. Confirm the Intent with a webhook before fulfilling.
}
```

<!-- !::confirmPaymentFlow:: -->

<!-- !::PaymentFlowResultInterface:: -->

Treat `Canceled` as cancellation and `Failed` as an error. Neither result authorizes fulfillment by itself.

## 4. addListener

Register result listeners once at application startup. Prefer events over the Promise after Android Activity recreation, including the `Created` event. See [Event Listeners](./learn/event-listeners.md).

```ts
await Promise.all([
  Stripe.addListener(PaymentFlowEventsEnum.Created, (info) => {
    console.log(info.cardNumber);
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Completed, () => {
    console.log('PaymentFlowEventsEnum.Completed');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Canceled, () => {
    console.log('PaymentFlowEventsEnum.Canceled');
  }),
  Stripe.addListener(PaymentFlowEventsEnum.Failed, (error) => {
    console.log('PaymentFlowEventsEnum.Failed', error);
  }),
]);
```

<!-- !::PaymentFlowEventsEnum:: -->

## Reference

- [Complete the payment in your own UI (iOS)](https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-flowcontroller)
- [Complete the payment in your own UI (Android)](https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#android-flowcontroller)
