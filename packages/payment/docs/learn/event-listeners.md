---
title: "Event Listeners"
code: []
scrollActiveLine: []
---

Use result events as the default result path. Register application-level result listeners once per JavaScript application startup, as early as possible during bootstrap—for example from `main.ts`, an application initializer, or a singleton service initialized at startup—and before presenting Stripe UI.

```ts
import {
  ApplePayEventsEnum,
  GooglePayEventsEnum,
  PaymentFlowEventsEnum,
  PaymentSheetEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';

await Promise.all([
  Stripe.addListener(PaymentSheetEventsEnum.Completed, () => handleCompleted()),
  Stripe.addListener(PaymentSheetEventsEnum.Canceled, () => handleCanceled()),
  Stripe.addListener(PaymentSheetEventsEnum.Failed, (error) => handleFailed(error)),
]);
```

<!-- !::addListener:: -->

<!-- !::PluginListenerHandle:: -->

## Android activity recreation

This is especially important on Android, where the Activity and JavaScript runtime can be recreated while Stripe's UI is open. The new JavaScript runtime must register its listeners during bootstrap.

The original JavaScript Promise and Capacitor `PluginCall` cannot be restored. If Stripe delivers the native result after recreation, the plugin retains the corresponding result event until a listener is available. This applies to the `Completed`, `Canceled`, and `Failed` events for PaymentSheet, PaymentFlow, and Google Pay, and to the `Created` event for PaymentFlow.

If the original call still exists, behavior is unchanged: the Promise is settled normally and the event is delivered without being retained. This fallback is an in-memory handoff of a native result; it is not persistent storage and does not guarantee recovery after OS process death.

Keep application-level result listeners registered for the lifetime of the JavaScript runtime. Do not add them in a button handler and remove them when a page unmounts if you still need the payment result after Android recreation.

## PaymentSheet events

<!-- !::PaymentSheetEventsEnum:: -->

Typical PaymentSheet flow:

1. Register result listeners at startup.
2. Call `createPaymentSheet()`.
3. Wait for `Loaded`, or handle `FailedToLoad`.
4. Call `presentPaymentSheet()`.
5. Receive one of `Completed`, `Canceled`, or `Failed`.

`Canceled` means the customer dismissed the sheet. Treat it as cancellation, not as a thrown error. `Failed` and `FailedToLoad` include an error string. Do not fulfill an order from the client event alone; confirm the PaymentIntent or SetupIntent with a [webhook](./server-integration.md).

## PaymentFlow events

<!-- !::PaymentFlowEventsEnum:: -->

Typical PaymentFlow flow:

1. Register result listeners at startup.
2. Call `createPaymentFlow()`.
3. Wait for `Loaded`, or handle `FailedToLoad`.
4. Call `presentPaymentFlow()`.
5. Receive `Opened`, then `Created` with `{ cardNumber }`, or `Canceled`.
6. Call `confirmPaymentFlow()`.
7. Receive one of `Completed`, `Canceled`, or `Failed`.

## Apple Pay events

<!-- !::ApplePayEventsEnum:: -->

`DidSelectShippingContact` includes `contact` and `updateId`. On iOS, call `updateApplePaySheet` with that `updateId` and updated `paymentSummaryItems`. If JavaScript does not respond, the native sheet falls back to the original items after 25 seconds. `updateApplePaySheet` is not implemented on Android or web.

`DidCreatePaymentMethod` includes the shipping `contact`. Apple does not return the full address until a successful payment.

## Google Pay events

<!-- !::GooglePayEventsEnum:: -->

Google Pay is available on Android and web. It is not implemented on iOS.
