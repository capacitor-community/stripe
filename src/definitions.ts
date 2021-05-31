import type { Card, BankAccount } from '@stripe/stripe-js'

import type { ApplePayDefinitions } from './types/applepay';
import type { GooglePayDefinitions } from './types/googlepay';
import type { HelperDefinitions } from './types/helper';
import type { IntentDefinitions } from './types/intent';
import type { PaymentDefinitions } from './types/payment';
import type {
  IdempotencyKeyOpt,
  StripeAccountIdOpt,
  TokenResponse,
} from './types/shared';
import type { TokenDefinitions } from './types/token';

export * from './types/applepay/index';
export * from './types/googlepay/index';
export * from './types/intent/index';
export * from './types/token/index';
export * from './types/payment/index';
export * from './types/helper/index';
export * from './types/shared/index';

type StripeDefinitions = TokenDefinitions &
  PaymentDefinitions &
  IntentDefinitions &
  HelperDefinitions &
  ApplePayDefinitions &
  GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  /* Core */
  setPublishableKey(opts: SetPublishableKeyOptions): Promise<void>;

  createCardToken(card: CardTokenRequest): Promise<CardTokenResponse>;

  createBankAccountToken(
    bankAccount: BankAccountTokenRequest,
  ): Promise<BankAccountTokenResponse>;
}

export type SetPublishableKeyOptions = {
  key: string;
};

export interface CardTokenRequest
  extends StripeAccountIdOpt,
    IdempotencyKeyOpt {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_zip?: string;
  currency?: string;
  /**
   * iOS only
   */
  phone?: string;
  /**
   * iOS only
   */
  email?: string;
}

export interface CardTokenResponse extends TokenResponse {
  card: Card;
}

export interface BankAccountTokenRequest
  extends StripeAccountIdOpt,
    IdempotencyKeyOpt {
  country: string;
  currency: string;
  account_holder_name: string;
  account_holder_type: string;
  routing_number: string;
  account_number: string;
}

export interface BankAccountTokenResponse extends TokenResponse {
  bank_account: BankAccount;
}

// const SourceTypeArray: SourceType[] = Object.keys(SourceType).map((key: any) => SourceType[key] as any as SourceType);
