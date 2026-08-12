import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
