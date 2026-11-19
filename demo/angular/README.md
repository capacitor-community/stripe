# Angular Stripe demo

Use this app to exercise Payment, Identity, Terminal, and experimental Billing. The DEMO page exposes individual operations; the scenario pages group setup and SDK calls under **PROCESS** and show results under **EXPECT**. A passing SDK call is not a verified server payment, identity outcome, or entitlement authorization.

## Build and run

From the repository root, build the local packages before installing the demo, which references them through `file:` dependencies:

```sh
npm ci
npm run build
cd demo/angular
npm ci
npm run cap
npx cap sync ios
npx cap open ios
```

For Android, replace the last two commands with `npx cap sync android` and `npx cap open android`. Billing requires an SPM-based iOS project; it has no Android or web implementation. Terminal reader types and wallets also vary by platform; see the [package support table](../../README.md#choose-a-package).

For browser development, run `npm start` from this directory after installing dependencies. Card flows use web custom elements; wallet flows require HTTPS and eligible browser/device settings.

## Backend and environments

The checked-in environments point to the hosted [demo Worker](../server/README.md). App users do not enter Stripe secret keys, Billing tokens, or Customer IDs. A developer using a different Stripe account must configure the Worker and matching publishable keys/catalog first.

`npm run cap` builds the production Angular configuration and uses `src/environments/environment.prod.ts`. `npm start` uses `environment.ts`. For a local backend, change the appropriate `api` URL, retaining its trailing slash. A phone needs a reachable endpoint; its `localhost` is not your development computer. Use a reachable HTTPS development endpoint for native/browser flows that require it.

To run the demo's checks:

```sh
npm run test:ci
npm run lint
npm run build:ci
```

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
