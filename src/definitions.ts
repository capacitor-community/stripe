import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';
import type { HelperDefinitions } from './helper';
import type { IntentDefinitions } from './intent';
import type { PaymentDefinitions } from './payment';
import type {
  BankAccount,
  Card,
  IdempotencyKeyOpt,
  StripeAccountIdOpt,
  TokenResponse,
} from './shared';
import type { TokenDefinitions } from './token';

export * from './applepay/index';
export * from './googlepay/index';
export * from './intent/index';
export * from './token/index';
export * from './payment/index';
export * from './helper/index';
export * from './shared/index';

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
