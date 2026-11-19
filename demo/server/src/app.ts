import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sign, verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { paymentIntentRequestSchema, setupIntentRequestSchema } from './api';
import { parseJsonBody } from './request';
import { createStripeClient } from './stripe-client';
import type { Bindings, StripeClient } from './types';

const resolveCustomerId = async (
  stripe: StripeClient,
  customerId?: string,
): Promise<string> => {
  if (customerId) return customerId;
  const customer = await stripe.createCustomer();
  return customer.id;
};

export const createApp = (injectedStripe?: StripeClient) => {
  const app = new Hono<Bindings>();

  app.use('*', cors());
  app.use('*', async (c, next) => {
    const stripe =
      injectedStripe ?? createStripeClient(c.env.STRIPE_SECRET_KEY);
    c.set('stripe', stripe);
    await next();
  });

  app.get('/', (c) => c.text('Hello World!'));

  app.use('/billing/*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    const env = c.env;
    if (
      !env ||
      !env.BILLING_SESSION_SECRET ||
      env.BILLING_SESSION_SECRET.length < 32 ||
      !env.BILLING_BUY_BUTTON_ID ||
      !env.BILLING_ENTITLEMENT_LOOKUP_KEY ||
      !env.BILLING_PUBLISHABLE_KEY?.startsWith('pk_test_') ||
      !/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY ?? '')
    ) {
      return c.json(
        { error: 'Billing demo is not configured with test credentials.' },
        503,
      );
    }
    if (c.req.path === '/billing/demo' && c.req.method === 'POST')
      return next();
    try {
      const token = c.req.header('Authorization')?.match(/^Bearer (.+)$/)?.[1];
      if (!token) return c.json({ error: 'Start a new Billing demo.' }, 401);
      const claims = await verify(token, env.BILLING_SESSION_SECRET, 'HS256');
      if (
        claims.aud !== 'billing-demo' ||
        typeof claims.sub !== 'string' ||
        !claims.sub.startsWith('cus_') ||
        typeof claims.exp !== 'number'
      ) {
        return c.json({ error: 'Start a new Billing demo.' }, 401);
      }
      c.set('billingCustomer', claims.sub);
    } catch {
      return c.json({ error: 'Start a new Billing demo.' }, 401);
    }
    return next();
  });

  // Each anonymous TEST demo gets its own customer. No shared customer's token
  // or subscription state is distributed to other installations.
  app.post('/billing/demo', async (c) => {
    try {
      const customer = await c.get('stripe').createCustomer();
      const now = Math.floor(Date.now() / 1000);
      const token = await sign(
        { sub: customer.id, aud: 'billing-demo', iat: now, exp: now + 3600 },
        c.env.BILLING_SESSION_SECRET!,
        'HS256',
      );
      return c.json({
        token,
        publishableKey: c.env.BILLING_PUBLISHABLE_KEY!,
        buyButtonId: c.env.BILLING_BUY_BUTTON_ID!,
        entitlementLookupKey: c.env.BILLING_ENTITLEMENT_LOOKUP_KEY!,
      });
    } catch {
      return c.json({ error: 'Unable to start the Billing test demo.' }, 502);
    }
  });

  app.get('/billing/config', (c) =>
    c.json({
      publishableKey: c.env.BILLING_PUBLISHABLE_KEY!,
      buyButtonId: c.env.BILLING_BUY_BUTTON_ID!,
      entitlementLookupKey: c.env.BILLING_ENTITLEMENT_LOOKUP_KEY!,
    }),
  );

  app.post('/billing/customer-session', async (c) => {
    try {
      // A client-supplied customer ID must never select another customer's session.
      const session = await c
        .get('stripe')
        .createBillingCustomerSession(
          c.get('billingCustomer'),
          c.env.BILLING_API_VERSION ?? '2026-08-26.dahlia',
        );
      return c.json(session);
    } catch {
      // Do not log Stripe request/response objects containing session credentials.
      return c.json(
        {
          error:
            'Unable to create a Billing Customer Session. Check preview access and server configuration.',
        },
        502,
      );
    }
  });

  app.post('/intent', async (c) => {
    const input = await parseJsonBody(c.req, paymentIntentRequestSchema);
    const stripe = c.get('stripe');
    const customer = await resolveCustomerId(stripe, input.customer_id);
    const [ephemeralKey, paymentIntent] = await Promise.all([
      stripe.createCustomerEphemeralKey(customer),
      stripe.createPaymentIntent({
        amount: input.amount ?? 1099,
        currency: input.currency ?? 'usd',
        customer,
      }),
    ]);

    return c.json({
      paymentIntent: paymentIntent.clientSecret,
      ephemeralKey: ephemeralKey.secret,
      customer,
    });
  });

  app.post('/intent/setup', async (c) => {
    const input = await parseJsonBody(c.req, setupIntentRequestSchema);
    const stripe = c.get('stripe');
    const customer = await resolveCustomerId(stripe, input.customer_id);
    const [ephemeralKey, setupIntent] = await Promise.all([
      stripe.createCustomerEphemeralKey(customer),
      stripe.createSetupIntent(customer),
    ]);

    return c.json({
      setupIntent: setupIntent.clientSecret,
      ephemeralKey: ephemeralKey.secret,
      customer,
    });
  });

  app.post('/intent/without-customer', async (c) => {
    const input = await parseJsonBody(c.req, paymentIntentRequestSchema);
    const intent = await c.get('stripe').createPaymentIntent({
      amount: input.amount ?? 1099,
      currency: input.currency ?? 'usd',
    });
    return c.json({ paymentIntent: intent.clientSecret });
  });

  app.post('/identify', async (c) => {
    const stripe = c.get('stripe');
    const session = await stripe.createVerificationSession();
    const ephemeralKey = await stripe.createVerificationEphemeralKey(
      session.id,
    );
    return c.json({
      verficationSessionId: session.id,
      ephemeralKeySecret: ephemeralKey.secret,
      clientSecret: session.clientSecret,
    });
  });

  app.post('/connection/token', async (c) => {
    const token = await c.get('stripe').createConnectionToken();
    return c.json({ secret: token.secret });
  });

  app.post('/connection/location', async (c) => {
    const location = await c.get('stripe').createLocation();
    return c.json({ locationId: location.id });
  });

  app.post('/connection/intent', async (c) => {
    const input = await parseJsonBody(c.req, paymentIntentRequestSchema);
    const intent = await c.get('stripe').createPaymentIntent({
      amount: input.amount ?? 1000,
      currency: input.currency ?? 'usd',
      customer: input.customer_id,
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
    });
    return c.json({ paymentIntent: intent.clientSecret });
  });

  app.onError((error, c) => {
    if (error instanceof HTTPException) {
      return error.getResponse();
    }
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  });

  return app;
};

export const app = createApp();
