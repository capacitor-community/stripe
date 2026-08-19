---
title: "React Quick start"
code: []
scrollActiveLine: []
---

Wrap the application with `CapacitorStripeProvider`. The provider calls `Stripe.initialize`, checks Apple Pay and Google Pay availability, and registers `stripe-pwa-elements` on web.

```tsx:App.tsx
import { CapacitorStripeProvider } from '@capacitor-community/stripe/react';

const App: React.FC = () => (
  <CapacitorStripeProvider
    publishableKey="Your Publishable Key"
    fallback={<p>Loading...</p>}
  >
    <IonApp>{/* ... */}</IonApp>
  </CapacitorStripeProvider>
);

export default App;
```

`CapacitorStripeProvider` also accepts optional `stripeAccount` for [Stripe Connect](https://stripe.com/docs/connect/authentication).

## Use the Stripe client

Read the initialized client with `useCapacitorStripe`. The returned `stripe` object is the same plugin instance as `Stripe` from `@capacitor-community/stripe`.

```ts
import { useCapacitorStripe } from '@capacitor-community/stripe/react';

export const PaymentSheet: React.FC = () => {
  const { stripe, isApplePayAvailable, isGooglePayAvailable } = useCapacitorStripe();
  // ...
};
```

```tsx
export const PaymentSheet: React.FC = () => {
  const { stripe } = useCapacitorStripe();
  return (
    <button
      onClick={async () => {
        await stripe.createPaymentSheet({
          paymentIntentClientSecret,
          merchantDisplayName: 'App Name',
        });
        await stripe.presentPaymentSheet();
      }}
    >
      Pay
    </button>
  );
};
```

Register result listeners once during application startup, not inside a payment button handler. See [Event Listeners](./learn/event-listeners.md).

The official React demo is at [capacitor-community/stripe/demo/react](https://github.com/capacitor-community/stripe/tree/main/demo/react).
