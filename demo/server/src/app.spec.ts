import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import type { StripeClient } from './types';

const stripe = {
  createBillingCustomerSession: vi.fn(async (customer: string) => ({
    customer,
    clientSecret: 'cuss_test',
    expiresAt: 4102444800,
  })),
  createCustomer: vi.fn(async () => ({ id: 'cus_new' })),
  createCustomerEphemeralKey: vi.fn(async () => ({ secret: 'eph_secret' })),
  createPaymentIntent: vi.fn(async () => ({ clientSecret: 'pi_secret' })),
  createSetupIntent: vi.fn(async () => ({ clientSecret: 'seti_secret' })),
  createVerificationSession: vi.fn(async () => ({
    id: 'vs_123',
    clientSecret: 'vs_secret',
  })),
  createVerificationEphemeralKey: vi.fn(async () => ({
    secret: 'eph_identity',
  })),
  createConnectionToken: vi.fn(async () => ({ secret: 'pst_test' })),
  createLocation: vi.fn(async () => ({ id: 'tml_test' })),
} satisfies StripeClient;

const app = createApp(stripe);

const postJson = (path: string, body: unknown = {}) =>
  app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('demo Worker', () => {
  const billingEnv = {
    STRIPE_SECRET_KEY: 'sk_test_placeholder',
    BILLING_DEMO_TOKEN: 'local-demo-token',
    BILLING_CUSTOMER_ID: 'cus_billing_demo',
    BILLING_PUBLISHABLE_KEY: 'pk_test_placeholder',
    BILLING_BUY_BUTTON_ID: 'buy_btn_demo',
    BILLING_ENTITLEMENT_LOOKUP_KEY: 'premium',
  };

  it('keeps Billing disabled without test configuration and rejects unauthenticated access', async () => {
    for (const [path, method] of [
      ['/billing/config', 'GET'],
      ['/billing/customer-session', 'POST'],
    ]) {
      expect((await app.request(path, { method }, {})).status).toBe(503);
      expect(
        (
          await app.request(
            path,
            { method },
            { ...billingEnv, STRIPE_SECRET_KEY: 'sk_live_placeholder' },
          )
        ).status,
      ).toBe(503);
      expect((await app.request(path, { method }, billingEnv)).status).toBe(
        401,
      );
      expect(
        (
          await app.request(
            path,
            { method, headers: { Authorization: 'Bearer wrong' } },
            billingEnv,
          )
        ).status,
      ).toBe(401);
    }
    expect(stripe.createBillingCustomerSession).not.toHaveBeenCalled();
  });

  it('issues fresh sessions only for the server-selected Billing customer without caching secrets', async () => {
    const headers = {
      Authorization: 'Bearer local-demo-token',
      'Content-Type': 'application/json',
    };
    const config = await app.request(
      '/billing/config',
      { headers },
      billingEnv,
    );
    expect(await config.json()).toEqual({
      publishableKey: 'pk_test_placeholder',
      buyButtonId: 'buy_btn_demo',
      entitlementLookupKey: 'premium',
    });
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await app.request(
        '/billing/customer-session',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ customer_id: 'cus_someone_else' }),
        },
        billingEnv,
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(await response.json()).toEqual({
        customer: 'cus_billing_demo',
        clientSecret: 'cuss_test',
        expiresAt: 4102444800,
      });
    }
    expect(stripe.createBillingCustomerSession).toHaveBeenCalledTimes(2);
    expect(stripe.createBillingCustomerSession).toHaveBeenCalledWith(
      'cus_billing_demo',
      '2026-08-26.dahlia',
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes a health endpoint', async () => {
    const response = await app.request('/');

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('Hello World!');
  });

  it('creates a customer and PaymentIntent with the existing defaults', async () => {
    const response = await postJson('/intent');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      paymentIntent: 'pi_secret',
      ephemeralKey: 'eph_secret',
      customer: 'cus_new',
    });
    expect(stripe.createCustomer).toHaveBeenCalledOnce();
    expect(stripe.createCustomerEphemeralKey).toHaveBeenCalledWith('cus_new');
    expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
      amount: 1099,
      currency: 'usd',
      customer: 'cus_new',
    });
  });

  it('accepts the bodyless POST used by the React demo', async () => {
    const response = await app.request('/intent', { method: 'POST' });

    expect(response.status).toBe(200);
    expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
      amount: 1099,
      currency: 'usd',
      customer: 'cus_new',
    });
  });

  it('reuses a supplied customer and request values', async () => {
    const response = await postJson('/intent', {
      amount: 2500,
      currency: 'jpy',
      customer_id: 'cus_existing',
    });

    expect(response.status).toBe(200);
    expect(stripe.createCustomer).not.toHaveBeenCalled();
    expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
      amount: 2500,
      currency: 'jpy',
      customer: 'cus_existing',
    });
  });

  it('creates a SetupIntent', async () => {
    const response = await postJson('/intent/setup', {
      customer_id: 'cus_existing',
    });

    await expect(response.json()).resolves.toEqual({
      setupIntent: 'seti_secret',
      ephemeralKey: 'eph_secret',
      customer: 'cus_existing',
    });
    expect(stripe.createSetupIntent).toHaveBeenCalledWith('cus_existing');
  });

  it('creates a PaymentIntent without a customer', async () => {
    const response = await postJson('/intent/without-customer');

    await expect(response.json()).resolves.toEqual({
      paymentIntent: 'pi_secret',
    });
    expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
      amount: 1099,
      currency: 'usd',
    });
  });

  it('creates an Identity verification session', async () => {
    const response = await postJson('/identify');

    await expect(response.json()).resolves.toEqual({
      verficationSessionId: 'vs_123',
      ephemeralKeySecret: 'eph_identity',
      clientSecret: 'vs_secret',
    });
    expect(stripe.createVerificationEphemeralKey).toHaveBeenCalledWith(
      'vs_123',
    );
  });

  it('creates Terminal resources', async () => {
    const tokenResponse = await postJson('/connection/token');
    const locationResponse = await postJson('/connection/location');
    const intentResponse = await postJson('/connection/intent', {
      customer_id: 'cus_terminal',
    });

    await expect(tokenResponse.json()).resolves.toEqual({ secret: 'pst_test' });
    await expect(locationResponse.json()).resolves.toEqual({
      locationId: 'tml_test',
    });
    await expect(intentResponse.json()).resolves.toEqual({
      paymentIntent: 'pi_secret',
    });
    expect(stripe.createPaymentIntent).toHaveBeenCalledWith({
      amount: 1000,
      currency: 'usd',
      customer: 'cus_terminal',
      payment_method_types: ['card_present'],
      capture_method: 'automatic',
    });
  });

  it('rejects malformed payment input before calling Stripe', async () => {
    const response = await postJson('/intent', { amount: '1099' });

    expect(response.status).toBe(400);
    expect(stripe.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('adds CORS headers', async () => {
    const response = await app.request('/intent', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://example.com',
        'access-control-request-method': 'POST',
      },
    });

    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });
});
