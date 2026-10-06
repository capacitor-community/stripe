import Stripe from 'stripe';
import { z } from 'zod';
import type { StripeClient } from './types';

const requireSecret = (
  secret: string | null | undefined,
  resource: string,
): string => {
  if (!secret) {
    throw new Error(`Stripe did not return a client secret for ${resource}`);
  }
  return secret;
};

export const createStripeClient = (secretKey: string): StripeClient => {
  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  return {
    async createBillingCustomerSession(customerId, apiVersion) {
      // These preview components are not included in the stable stripe-node types.
      const response = await stripe.rawRequest(
        'POST',
        '/v1/customer_sessions',
        {
          customer: customerId,
          components: {
            buy_button: { enabled: true },
            active_entitlements: { enabled: true },
            customer_portal: { enabled: true },
          },
        },
        { apiVersion },
      );
      const session = z
        .object({
          customer: z.literal(customerId),
          client_secret: z.string().min(1),
          expires_at: z.number().int().positive(),
        })
        .parse(response);
      return {
        customer: session.customer,
        clientSecret: session.client_secret,
        expiresAt: session.expires_at,
      };
    },
    async createCustomer() {
      const customer = await stripe.customers.create();
      return { id: customer.id };
    },
    async createCustomerEphemeralKey(customerId) {
      const key = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: '2020-08-27' },
      );
      return {
        secret: requireSecret(key.secret, 'Customer EphemeralKey'),
      };
    },
    async createPaymentIntent(input) {
      const intent = await stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        customer: input.customer,
        payment_method_types: input.payment_method_types,
        capture_method: input.capture_method,
      });
      return {
        clientSecret: requireSecret(intent.client_secret, 'PaymentIntent'),
      };
    },
    async createSetupIntent(customerId) {
      const intent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'on_session',
      });
      return {
        clientSecret: requireSecret(intent.client_secret, 'SetupIntent'),
      };
    },
    async createVerificationSession() {
      const session = await stripe.identity.verificationSessions.create({
        type: 'document',
        metadata: { user_id: '1' },
      });
      return {
        id: session.id,
        clientSecret: requireSecret(
          session.client_secret,
          'VerificationSession',
        ),
      };
    },
    async createVerificationEphemeralKey(verificationSessionId) {
      const key = await stripe.ephemeralKeys.create(
        { verification_session: verificationSessionId },
        { apiVersion: '2022-11-15' },
      );
      return {
        secret: requireSecret(key.secret, 'Verification EphemeralKey'),
      };
    },
    async createConnectionToken() {
      const token = await stripe.terminal.connectionTokens.create();
      return { secret: token.secret };
    },
    async createLocation() {
      const location = await stripe.terminal.locations.create({
        display_name: 'Venice Burrito Shop',
        address: {
          line1: '1272 Valencia Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
          postal_code: '94110',
        },
      });
      return { id: location.id };
    },
  };
};
