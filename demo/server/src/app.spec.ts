import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import type { StripeClient } from './types';

const stripe = {
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
