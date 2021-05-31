import type { CardBrand } from './enum';

export * from './enum';

export type AvailabilityResponse = { available: boolean };


export interface PaymentMethod {
  created?: number;
  customerId?: string;
  id?: string;
  livemode: boolean;
  type?: string;
  card?: Card;
}


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

export interface BankAccount {
  id: string;
  object: string;
  account_holder_name: string;
  account_holder_type: string;
  bank_name: string;
  country: string;
  currency: string;
  fingerprint: string;
  last4: string;
  routing_number: string;
  status: string;
}



export interface TokenResponse {
  id: string;
  type: string;
  created: Date;
}


export interface Card {
  /**
   * Id exists for cards but not payment methods
   */
  id?: string;
  brand: CardBrand;
  country: string;
  cvc_check: any;
  three_d_secure_usage?: {
    supported: boolean;
  };
  last4: string;
  funding?: string;
  exp_month: number;
  exp_year: number;
  object?: string;
  address_city?: string;
  address_country?: string;
  address_line1?: string;
  address_line1_check?: string;
  address_line2?: string;
  address_state?: string;
  address_zip?: string;
  address_zip_check?: string;
  dynamic_last4: any;
  fingerprint?: string;
  metadata?: any;
  name?: string;
  tokenization_method?: string;
  phone?: string;
  email?: string;
}


export interface Address {
  line1: string;
  line2: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
}
