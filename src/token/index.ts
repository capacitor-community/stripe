import type {Address,
  TokenResponse,
  IdempotencyKeyOpt,
  StripeAccountIdOpt} from '../shared';

import type {SourceType} from './enum';

export * from './enum'

export interface TokenDefinitions {
  createSourceToken(opts: CreateSourceTokenOptions): Promise<TokenResponse>;

  createPiiToken(opts: CreatePiiTokenOptions): Promise<TokenResponse>;

  createAccountToken(account: AccountParams): Promise<TokenResponse>;
}

export type CreateSourceTokenOptions = {
  type: SourceType;
  params: SourceParams;
};

export type CreatePiiTokenOptions = {
  pii: string;
} & StripeAccountIdOpt &
  IdempotencyKeyOpt;

export interface AccountParams extends StripeAccountIdOpt, IdempotencyKeyOpt {
  tosShownAndAccepted: boolean;
  legalEntity: CompanyLegalEntityParams | IndividualLegalEntityParams;
}


export type SourceParams =
  | ThreeDeeSecureParams
  | GiroPayParams
  | iDEALParams
  | SEPADebitParams
  | SofortParams
  | AlipayParams
  | AlipayReusableParams
  | P24Params
  | VisaCheckoutParams;


export interface ThreeDeeSecureParams {
  /**
   * Amount
   */
  amount: number;
  /**
   * Currency code
   */
  currency: string;
  /**
   * URL to redirect to after successfully verifying the card
   */
  returnURL: string;
  /**
   * Card source ID
   */
  card: string;
}

export interface GiroPayParams {
  amount: number;
  name: string;
  returnURL: string;
  statementDescriptor: string;
}

export interface iDEALParams {
  amount: number;
  name: string;
  returnURL: string;
  statementDescriptor: string;
  bank: string;
}

export interface SEPADebitParams {
  name: string;
  iban: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SofortParams {
  amount: number;
  returnURL: string;
  country: string;
  statementDescriptor: string;
}

export interface AlipayParams {
  amount: number;
  currency: string;
  returnURL: string;
}

export interface AlipayReusableParams {
  currency: string;
  returnURL: string;
}

export interface P24Params {
  amount: number;
  currency: string;
  email: string;
  name: string;
  returnURL: string;
}

export interface VisaCheckoutParams {
  callId: string;
}


export interface CompanyLegalEntityParams extends LegalEntityParams {
  type?: 'company';

  /**
   * The company’s legal name.
   *
   * [account.company.name](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-name)
   */
  name?: string;

  /**
   * Whether the company’s owners have been provided. Set this
   * Boolean to `true` after creating all the company’s owners with the
   * [Persons API](https://stripe.com/docs/api/persons) for accounts with a
   * `relationship.owner` requirement.
   *
   * [account.company.owners_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-owners_provided)
   */
  owners_provided?: boolean;

  /**
   * Whether the company’s directors have been provided. Set
   * this Boolean to `true` after creating all the company’s directors with the
   * [Persons API](https://stripe.com/docs/api/persons) for accounts with a
   * `relationship.director` requirement. This value is not automatically set to
   * `true` after creating directors, so it needs to be updated to indicate all
   * directors have been provided.
   *
   * [account.company.directors_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-directors_provided)
   */
  directors_provided?: boolean;

  /**
   * Whether the company’s executives have been provided.
   * Set this Boolean to `true` after creating all the company’s executives with the
   * [Persons API](https://stripe.com/docs/api/persons) for accounts with a
   * `relationship.executive` requirement.
   *
   * [account.company.executives_provided](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-executives_provided)
   */
  executives_provided?: boolean;

  /**
   * The business ID number of the company, as appropriate for the
   * company’s country. (Examples are an Employer ID Number in the U.S.,
   * a Business Number in Canada, or a Company Number in the UK.)
   *
   * [account.company.tax_id](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-tax_id)
   */
  tax_id?: string;

  /**
   * The jurisdiction in which the `tax_id` is registered
   * (Germany-based companies only).
   *
   * [account.company.tax_id_registrar](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-tax_id_registrar)
   */
  tax_id_registrar?: string;

  /**
   * The VAT number of the company.
   *
   * [account.company.vat_id](https://stripe.com/docs/api/tokens/create_account#create_account_token-account-company-vat_id)
   */
  vat_id?: string;

  /**
   *  The company’s phone number (used for verification).
   */
  phone?: string;
}


export interface IndividualLegalEntityParams extends LegalEntityParams {
  type: 'individual';

  /**
   * The individual’s first name.
   */
  first_name?: string;

  /**
   * The individual’s last name.
   */
  last_name?: string;

  /**
   * The individual’s email.
   */
  email?: string;

  /**
   * The individual’s gender (International regulations require either “male” or “female”).
   */
  gender?: 'male' | 'female';

  /**
   * The government-issued ID number of the individual, as appropriate
   * for the representative’s country. (Examples are a Social Security Number in the
   * U.S., or a Social Insurance Number in Canada). Instead of the number itself, you
   * can also provide a PII token.
   */
  id_number?: string;

  /**
   * The individual’s phone number.
   */
  phone?: string;

  /**
   * The last four digits of the individual’s Social Security Number (U.S. only).
   */
  ssn_last4?: string;
}

export interface LegalEntityParams {
  type?: 'individual' | 'company';
  address?: Address;
  phone?: string;
}
