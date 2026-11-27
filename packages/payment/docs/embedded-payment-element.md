# Embed payment methods in an order screen

Use Stripe’s native Embedded Payment Element in an iOS or Android app when the order summary and pay button belong to your Web layout. Selecting a payment method can open a native Stripe sheet to collect its details.

## Install

Android and Swift Package Manager use the Engine dependency supplied by the plugin. CocoaPods users who want embedded checkout must install the matching local pod as well:

```sh
npm install --save-exact @webview-native-ui/engine@1.0.11
```

Inside the existing app target in the Podfile, after the call to `capacitor_pods`, add these lines and run `npx cap sync ios`. Adjust both paths for a nonstandard project layout.

```ruby
pod 'WebViewNativeUIEngine', :path => '../../node_modules/@webview-native-ui/engine'
pod 'CapacitorCommunityStripe/Embedded', :path => '../../node_modules/@capacitor-community/stripe'
```

## Ionic overlays

For Ionic apps that present modals, alerts or other overlays above the payment selector, install `@webview-native-ui/engine@1.0.11` as an app dependency and enable overlay tracking once at startup, before presenting any overlays.

```ts
import { enableSupportIonicOverlays } from '@webview-native-ui/engine/ionic';

enableSupportIonicOverlays();
```

## Mount and confirm

[Initialize Stripe](initialize.md) once. Have your backend calculate the order total, create a PaymentIntent and return its client secret, amount in minor units and currency. Use those same values when mounting the selector.

```html
<div id="payment-methods" style="min-height: 1px"></div>
<button id="pay" disabled>Pay</button>
```

```ts
import { EmbeddedPaymentElement, EmbeddedPaymentElementEventsEnum, Stripe } from '@capacitor-community/stripe';

const host = document.querySelector<HTMLElement>('#payment-methods')!;
const pay = document.querySelector<HTMLButtonElement>('#pay')!;
const listener = await Stripe.addListener(EmbeddedPaymentElementEventsEnum.Change, ({ ready, height }) => {
  pay.disabled = !ready;
  if (height) host.style.height = `${height}px`;
});
const payment = await EmbeddedPaymentElement.create(host, {
  merchantDisplayName: 'My store',
  amount: order.amount,
  currency: order.currency,
  paymentIntentClientSecret: order.clientSecret,
});

pay.onclick = async () => {
  pay.disabled = true;
  const { paymentResult } = await payment.confirm();
  showPaymentStatus(paymentResult);
};
```

Mount after the host is visible. Pass a rectangular block in the main document. Keep its axes aligned with the viewport and allow it to expand when Stripe reports its content height. The mount lasts until the order screen closes. On page exit, including Ionic navigation that caches the page, release both resources:

```ts
await listener.remove();
await payment.destroy();
```

A full document navigation releases the native selector. If your app restores a checkout document from the back-forward cache, mount the selector again on `pageshow` when `event.persisted` is true.

Confirmation returns the Completed, Canceled, or Failed member of `EmbeddedPaymentElementEventsEnum` in `paymentResult`. The matching event is also emitted. Subscribe to `EmbeddedPaymentElementEventsEnum.Failed` to receive the SDK error message in `{ error }`.

If the element is unmounted while confirmation is pending, the confirmation promise rejects and the plugin stops delivering its result events. The payment may still complete at Stripe.

The confirmation result describes the client-side flow. Fulfill the order from a verified Stripe webhook. See [server integration](server-integration.md).
