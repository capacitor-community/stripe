# iOS subscriptions with Stripe Billing

This package wraps [Stripe's experimental BillingSDK](https://docs.stripe.com/billing/subscriptions/manage-ios). Use an account enabled for the preview. Confirm purchase eligibility and applicable App Store requirements for your app and storefront before enabling checkout.

## Backend responsibilities

Authenticate the app user, find their Stripe Customer on the server, and create a **fresh Customer Session** whenever `customerSessionRequested` fires. Never accept the Customer ID from an untrusted client, embed a Stripe secret API key in the app, log the returned secret, or reuse Customer Session secrets between requests.

Enable `buy_button`, `active_entitlements`, and `customer_portal` on the Customer Session. Return:

```json
{
  "customer": "cus_...",
  "clientSecret": "cuss_...",
  "expiresAt": 1800000000
}
```

`expiresAt` is Unix time in **seconds**, not milliseconds. Return HTTP 401 only for a signed-out user; surface other failures as errors.

The pinned native SDK sends Stripe API version `2025-07-30.basil` and uses private preview endpoints. Stripe's current online guide uses `2026-08-26.dahlia` or later for the backend. Confirm that your enabled preview supports both the pinned SDK and your backend API version; a newer server API version alone does not grant preview access.

For example, in an existing authenticated server handler using the Stripe server SDK:

```ts
// user is obtained from your server's verified authentication middleware.
// stripe is your server-side Stripe client configured for your enabled preview.
const session = await stripe.customerSessions.create({
  customer: user.stripeCustomerId,
  components: {
    buy_button: { enabled: true },
    active_entitlements: { enabled: true },
    customer_portal: { enabled: true },
  },
});
return Response.json({
  customer: session.customer,
  clientSecret: session.client_secret,
  expiresAt: session.expires_at,
});
```

Use the Stripe server SDK/types supplied for your preview if these components are not yet available in the stable SDK. Configure buy buttons, subscription prices, product entitlements, and the Customer Portal in Stripe. Verify webhooks on the backend and enforce feature access server-side. Client entitlements are for UI gating, not an authorization boundary.

## App example

Register the session listener **before** `initialize` and retain it until after `reset`. Each request must receive one response within 30 seconds. Stale or duplicate responses are rejected. An invalid response can be corrected while the same request remains pending.

```ts
import { Capacitor } from '@capacitor/core';
import { StripeBilling, type CustomerSession } from '@capacitor-community/stripe-billing';

if (Capacitor.getPlatform() !== 'ios') {
  throw new Error('This subscription integration requires iOS');
}

const sessionListener = await StripeBilling.addListener('customerSessionRequested', async ({ requestId }) => {
  let session: CustomerSession | null = null;
  let failed = false;
  try {
    const response = await fetch('https://your-backend.example.com/customer-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await getAuthToken()}` },
    });
    if (response.status !== 401) {
      if (!response.ok) throw new Error('Customer Session request failed');
      session = await response.json() as CustomerSession;
    }
  } catch {
    failed = true;
  }
  try {
    await StripeBilling.setCustomerSession({ requestId, session, failed });
  } catch {
    // reset or the request timeout may have invalidated this response.
    // Show an authentication error if the app is still signed in; do not log secrets.
  }
});

const entitlementListener = await StripeBilling.addListener('entitlementsChanged', ({ entitlements }) => {
  updatePremiumUI(entitlements.some(item => item.lookupKey === 'premium'));
});
const errorListener = await StripeBilling.addListener('billingError', ({ message }) => {
  showError(message);
});

await StripeBilling.initialize({
  publishableKey: 'pk_test_...',
  maximumStaleEntitlementsDuration: 300,
});

// In your subscription button handler:
await StripeBilling.presentBuyButton({ id: 'buy_btn_...' });

// In your subscription management handler:
await StripeBilling.presentCustomerPortal();
// Use { external: true } to open the portal in the default browser.

// On returning to the app after checkout/external portal, refresh explicitly:
const { active } = await StripeBilling.hasEntitlement({ lookupKey: 'premium', forceRefresh: true });
updatePremiumUI(active);

// On sign-out or before changing accounts, first disable subscription actions:
await StripeBilling.reset();
await sessionListener.remove();
await entitlementListener.remove();
await errorListener.remove();
// Register listeners and initialize again for the next login.
```

`getAuthToken`, `updatePremiumUI`, and `showError` are application-specific functions. Keep each UI action separate; the calls above illustrate their respective handlers, not an automatic checkout sequence. Serialize calls: concurrent SDK operations reject instead of racing the SDK's caches. Session responses and `reset` can run while an operation is pending.

`getBuyButton({ id })` loads button metadata. `presentBuyButton` loads and presents the SDK's native button in a dismissible sheet; tapping it opens Stripe checkout in the default browser. Its Promise resolving means **presented**, not paid. A `null` session allows intentional anonymous checkout; backend failures must set `failed: true` so they never silently become anonymous purchases.

`getActiveEntitlements({ forceRefresh: true })` returns `{ entitlements }`, and `hasEntitlement` returns `{ active }`. The SDK can use cached entitlements when a network refresh fails; even `forceRefresh` is not proof of payment. `entitlementsChanged` is an SDK refresh notification, not a live webhook subscription. The in-app portal refreshes entitlements on dismissal; refresh explicitly after external checkout/portal returns.

Always await `reset` before switching users. It cancels pending session requests and operations, dismisses plugin UI, clears SDK caches, emits empty entitlements, and requires reinitialization. Initialization also clears the upstream cache because the pinned SDK does not scope its persisted entitlements by customer. Removing event listeners alone does not sign out.
