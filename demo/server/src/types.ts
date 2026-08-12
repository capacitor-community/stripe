export interface Env {
  STRIPE_SECRET_KEY: string;
}

export interface StripeClient {
  createCustomer(): Promise<{ id: string }>;
  createCustomerEphemeralKey(customerId: string): Promise<{ secret: string }>;
  createPaymentIntent(input: {
    amount: number;
    currency: string;
    customer?: string;
    payment_method_types?: ['card_present'];
    capture_method?: 'automatic';
  }): Promise<{ clientSecret: string }>;
  createSetupIntent(customerId: string): Promise<{ clientSecret: string }>;
  createVerificationSession(): Promise<{
    id: string;
    clientSecret: string;
  }>;
  createVerificationEphemeralKey(
    verificationSessionId: string,
  ): Promise<{ secret: string }>;
  createConnectionToken(): Promise<{ secret: string }>;
  createLocation(): Promise<{ id: string }>;
}

export type Bindings = {
  Bindings: Env;
  Variables: {
    stripe: StripeClient;
  };
};
