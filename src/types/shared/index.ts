import type { PaymentMethod } from '@stripe/stripe-js'


export * from './enum';

export type AvailabilityResponse = { available: boolean };


export type StripeAccountIdOpt = {
  /**
   * Optional
   * Used on Android only
   */
  stripeAccountId?: string;
};

export type IdempotencyKeyOpt = {
  /**
   * Optional
   * Used on Android only
   */
  idempotencyKey?: string;
};


export type CustomerPaymentMethodsResponse = {
  paymentMethods: PaymentMethod[];
};



export interface TokenResponse {
  id: string;
  type: string;
  created: Date;
}
