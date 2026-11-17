# Capacitor Stripe demo Worker

This Hono API supplies the PaymentIntent, SetupIntent, Identity, and Terminal
resources used by the demo applications. It runs on Cloudflare Workers.

The deployed demo is available at
`https://capacitor-stripe-demo-server.rdlabo.dev/`.

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

The Angular **BILLING** tab uses `GET /billing/config` and
`POST /billing/customer-session`. Both require `Authorization: Bearer <demo-token>`.
They remain disabled (503) until configured and reject live-mode credentials.

1. Copy `.dev.vars.example` to `.dev.vars` (gitignored).
2. Set the test secret/publishable keys for the same Stripe account enabled for
   the BillingSDK preview. Create a test Customer, subscription Buy Button,
   product entitlement, and Customer Portal configuration in that account.
3. Set `BILLING_CUSTOMER_ID`, `BILLING_BUY_BUTTON_ID`, and
   `BILLING_ENTITLEMENT_LOOKUP_KEY`. Set `BILLING_DEMO_TOKEN` to a long random
   value (for example `openssl rand -hex 32`). Do not put it in Angular source.
4. Run `npm run dev`. Point `demo/angular/src/environments/environment.ts`
   at this Worker (`http://localhost:3000/` in the iOS simulator). For a physical
   iPhone, use a reachable HTTPS development endpoint. Angular production builds
   use `environment.prod.ts`, so configure that URL too if building production.
5. Build/sync the Angular iOS app as described in
   [the Angular demo guide](../angular/README.md), then enter the demo token in
   the BILLING tab.

The configured token represents **one fixed demo user**. The server never uses a
client-supplied Customer ID and creates a fresh Customer Session for every request.
This is a manual test harness, not application authentication: use your verified
user-to-Customer mapping in production. All Billing responses use `no-store`;
never log session secrets. Existing non-Billing demo endpoints are unchanged.

`BILLING_API_VERSION` defaults to `2026-08-26.dahlia`. The pinned native preview
SDK itself uses `2025-07-30.basil`; verify that Stripe has enabled the required
preview APIs for this combination. An API version change alone does not grant
preview access. The server uses Stripe's raw request API for components missing
from the installed stable SDK types, and validates the response before returning it.

For a deployed Worker, use Wrangler secrets for `STRIPE_SECRET_KEY` and
`BILLING_DEMO_TOKEN`, and configure the remaining Billing variables for the target
environment. Do not commit credentials to `wrangler.toml` or `.dev.vars`.
