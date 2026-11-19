# Capacitor Stripe demo Worker

This Hono API supplies PaymentIntent, SetupIntent, Identity, Terminal,
and Billing resources used by the demo applications. It runs on Cloudflare Workers.

The deployed demo is available at
`https://capacitor-stripe-demo-server.rdlabo.dev/`.

## Responsibility and endpoint contracts

This is a test demo backend. Its public bootstrap and payment routes do not supply production user authentication, order authorization, webhook processing, or fulfillment. Build those responsibilities into your own backend before adapting the demo for real users. Keep Stripe secret keys and Customer Session credentials on their intended side of the app/server boundary.

| Endpoint                         | Client-safe response used by the demos                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `POST /intent`                   | PaymentIntent client secret as `paymentIntent`, Customer ID as `customer`, and `ephemeralKey` |
| `POST /intent/setup`             | SetupIntent client secret as `setupIntent`, `customer`, and `ephemeralKey`                    |
| `POST /intent/without-customer`  | PaymentIntent client secret as `paymentIntent`                                                |
| `POST /identify`                 | `verficationSessionId` (legacy spelling), `ephemeralKeySecret`, and `clientSecret`            |
| `POST /connection/token`         | Fresh Terminal connection token as `secret`                                                   |
| `POST /connection/location`      | Demo Terminal location ID as `locationId`                                                     |
| `POST /connection/intent`        | Card-present PaymentIntent client secret as `paymentIntent`                                   |
| `POST /billing/demo`             | One-hour demo credential and public Billing configuration                                     |
| `GET /billing/config`            | Public Billing configuration; does not create a demo credential                               |
| `POST /billing/customer-session` | Fresh Customer Session for the credential's Customer                                          |

Map Identity's legacy `verficationSessionId` to the plugin's `verificationId` option. PaymentIntent amounts in request bodies use Stripe's smallest currency unit; wallet `paymentSummaryItems.amount` instead uses major currency units.

## Local development

Install dependencies:

```sh
npm ci
```

The demo Stripe test key is configured as a regular Worker variable in
`wrangler.toml`. Run:

```sh
npm run dev
```

The local Worker listens on `http://localhost:3000`.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build:check
```

## Deployment

Deploy with `npm run deploy`. The GitHub Actions release workflow expects
the `CLOUDFLARE_API_TOKEN` repository secret for Cloudflare authentication.
The target account is configured in `wrangler.toml`.

## Billing demo (private preview, test mode only)

The Angular **BILLING** tab starts each scenario with one tap, without credentials
or customer IDs entered by the user. `POST /billing/demo` creates a new test
Customer and issues a signed credential valid for one hour, together with public
Billing configuration. `POST /billing/customer-session` uses that credential to
issue fresh SDK Customer Sessions for that customer only. Client-supplied Customer
IDs are ignored. Signing uses a separate `BILLING_SESSION_SECRET` held only on the server; the
Stripe API key cannot sign demo credentials. These anonymous test sessions are a demo harness, not production auth.

One-time maintainer setup:

1. Copy `.dev.vars.example` to `.dev.vars` (gitignored).
2. Set test secret/publishable keys for the same BillingSDK preview-enabled Stripe
   account. Create a test subscription Buy Button, product entitlement and Customer
   Portal configuration in that account.
3. Generate `BILLING_SESSION_SECRET` with `openssl rand -hex 32`. Set `BILLING_BUY_BUTTON_ID` and `BILLING_ENTITLEMENT_LOOKUP_KEY`. No shared demo
   token or fixed Customer ID is needed.
4. Run `npm run dev`. Point the Angular environment URL at this Worker. An iPhone
   needs a reachable HTTPS development endpoint; production builds use
   `environment.prod.ts`.
5. Run the app and tap a scenario in **BILLING**. Purchase, portal and entitlement
   checks share one demo customer until sign out. Sign out and restart for a fresh
   customer. For existing production users, use verified user-to-Customer mapping
   instead of this public test-only bootstrap.

Billing remains disabled (503) without complete test configuration or with live
credentials. All Billing responses use `no-store`. Do not log session credentials.
Existing non-Billing endpoints are unchanged.

`BILLING_API_VERSION` defaults to `2026-08-26.dahlia`. The pinned native preview
SDK itself uses `2025-07-30.basil`; verify that Stripe has enabled the required
preview APIs for this combination. An API version change alone does not grant
preview access. The server uses Stripe's raw request API for components missing
from the installed stable SDK types, and validates the response before returning it.

For a deployed Worker, use Wrangler secrets for `STRIPE_SECRET_KEY` and
`BILLING_SESSION_SECRET`, and configure the remaining Billing variables for the target
environment. Do not commit credentials to `wrangler.toml` or `.dev.vars`.
