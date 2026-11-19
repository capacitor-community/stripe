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

`expiresAt` is Unix time in **seconds**, not milliseconds. Reject unauthenticated requests with HTTP 401. The signed-in app must treat a rejected or expired login as a failure and ask the user to authenticate again. It must not silently switch to anonymous checkout.

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
    if (!response.ok) throw new Error('Customer Session request failed');
    session = (await response.json()) as CustomerSession;
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
  updatePremiumUI(entitlements.some((item) => item.lookupKey === 'premium'));
});
const errorListener = await StripeBilling.addListener('billingError', ({ message }) => {
  showError(message);
});

await StripeBilling.initialize({
  publishableKey: 'pk_test_...',
  maximumStaleEntitlementsDuration: 300,
});

// Enable subscription actions only after initialization completes.
```

`getAuthToken`, `updatePremiumUI`, and `showError` are application-specific functions. The example assumes a signed-in user. If your app intentionally supports anonymous checkout, return `session: null, failed: false` only after your app has confirmed that anonymous state. Network errors and HTTP 401 responses are failures.

### Separate UI actions

Connect these functions to separate actions in your app. Do not call them sequentially as a checkout flow. Serialize SDK operations; concurrent operations reject instead of racing the SDK's caches. Session responses and `reset` can run while an operation is pending.

```ts
async function purchaseSubscription(): Promise<void> {
  await StripeBilling.presentBuyButton({ id: 'buy_btn_...' });
}

async function manageSubscription(): Promise<void> {
  await StripeBilling.presentCustomerPortal();
  // Use { external: true } to open the portal in the default browser.
}

async function refreshAccess(): Promise<void> {
  const { active } = await StripeBilling.hasEntitlement({ lookupKey: 'premium', forceRefresh: true });
  updatePremiumUI(active);
}

async function signOutBilling(): Promise<void> {
  // First disable subscription actions in your application UI.
  await StripeBilling.reset();
  await sessionListener.remove();
  await entitlementListener.remove();
  await errorListener.remove();
  // Register listeners and initialize again for the next login.
}
```

Call `refreshAccess` when the app returns from external checkout or the external portal. Keep subscription actions disabled during initialization, another SDK operation, and account changes.

`getBuyButton({ id })` loads button metadata. `presentBuyButton` loads and presents the SDK's native button in a dismissible sheet; tapping it opens Stripe checkout in the default browser. Its Promise resolving means **presented**, not paid. A `null` session allows intentional anonymous checkout; backend failures must set `failed: true` so they never silently become anonymous purchases.

`getActiveEntitlements({ forceRefresh: true })` returns `{ entitlements }`, and `hasEntitlement` returns `{ active }`. The SDK can use cached entitlements when a network refresh fails; even `forceRefresh` is not proof of payment. `entitlementsChanged` is an SDK refresh notification, not a live webhook subscription. The in-app portal refreshes entitlements on dismissal; refresh explicitly after external checkout/portal returns.

Always await `reset` before switching users. It cancels pending session requests and operations, dismisses plugin UI, clears SDK caches, emits empty entitlements, and requires reinitialization. Initialization also clears the upstream cache because the pinned SDK does not scope its persisted entitlements by customer. Removing event listeners alone does not sign out.

## Try the repository demo

The [Angular Billing demo](../../../demo/angular/README.md#billing-demo-on-ios) creates temporary test customers and credentials automatically. Its [demo backend](../../../demo/server/README.md#billing-demo-private-preview-test-mode-only) is an anonymous, test-only harness. Production applications must implement the authenticated user-to-Customer mapping described above; the public demo credential is not a production login mechanism.
