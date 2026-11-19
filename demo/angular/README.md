# Angular Stripe demo

## Billing demo on iOS

The **BILLING** tab follows the other demos: tap a scenario under **PROCESS**;
its preparation and SDK calls run automatically and **EXPECT** shows each result.
There is no token or customer ID to enter. Billing is experimental, iOS-only,
and uses Stripe test mode. Android and web show an unsupported-platform message.

- **Expect Happy Path · New subscription** creates a demo customer if necessary,
  initializes Billing, loads the subscription button, and presents it. Complete
  Stripe test checkout, close the sheet, and tap **Check entitlements** to verify
  access. Presentation alone is not payment confirmation.
- **Manage subscription** opens the Customer Portal for the same demo customer.
  After making changes, return and tap **Check entitlements**.
- **Check entitlements** forces a refresh and checks the configured premium feature.
  An inactive feature is a valid result before purchasing a subscription.
- **Expect Sign Out** resets the native SDK and clears demo credentials and cached
  results. The next scenario creates a different test customer.

The backend issues a short-lived credential automatically for each new demo.
It creates a fresh Customer Session for every SDK request. Credentials stay in
memory and are never displayed. A demo lasts one hour; sign out to start again.

Maintainer setup: configure [the demo Worker](../server/README.md#billing-demo-private-preview-test-mode-only)
once with a preview-enabled test account, subscription Buy Button and entitlement.
Build and sync with `npm run cap` (production URL) and `npx cap sync ios`, then run
in Xcode. For local development, point the appropriate Angular environment file
at a reachable development Worker. No backend setup is performed by app users.
