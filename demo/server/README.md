# Capacitor Stripe demo Worker

This Hono API supplies the PaymentIntent, SetupIntent, Identity, and Terminal
resources used by the demo applications. It runs on Cloudflare Workers.

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
