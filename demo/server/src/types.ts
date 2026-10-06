export interface Env {
  STRIPE_SECRET_KEY: string;
  BILLING_DEMO_TOKEN?: string;
  BILLING_CUSTOMER_ID?: string;
  BILLING_PUBLISHABLE_KEY?: string;
  BILLING_BUY_BUTTON_ID?: string;
  BILLING_ENTITLEMENT_LOOKUP_KEY?: string;
  BILLING_API_VERSION?: string;
}

export interface StripeClient {
  createBillingCustomerSession(
    customerId: string,
    apiVersion: string,
  ): Promise<{
    customer: string;
    clientSecret: string;
    expiresAt: number;
  }>;
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
