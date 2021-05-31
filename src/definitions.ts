import type {
  ApplePayOptions,
  ApplePayResponse,
  FinalizeApplePayTransactionOptions,
} from './applepay';
import type { GooglePayOptions, GooglePayResponse } from './googlepay';
import type {
  ConfirmPaymentIntentResponse,
  ConfirmPaymentIntentOptions,
  ConfirmSetupIntentOptions,
  ConfirmSetupIntentResponse,
} from './intent';
import type {
  CompanyVerification,
  IndividualVerification,
} from './verification';

export * from './applepay';
export * from './googlepay';
export * from './verification';
export * from './intent';

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

export type SetPublishableKeyOptions = {
  key: string;
};

export type ValidateCardNumberOptions = {
  number: string;
};

export type ValidateExpiryDateOptions = {
  exp_month: number;
  exp_year: number;
};

export type ValidateCVCOptions = {
  cvc: string;
};

export type IdentifyCardBrandOptions = {
  number: string;
};

export type CreatePiiTokenOptions = {
  pii: string;
} & StripeAccountIdOpt &
  IdempotencyKeyOpt;

export type CreateSourceTokenOptions = {
  type: SourceType;
  params: SourceParams;
};

export type ValidityResponse = { valid: boolean };
export type AvailabilityResponse = { available: boolean };

export type CardBrandResponse = { brand: CardBrand };

export type InitCustomerSessionParams = {
  id: string;
  object: 'ephemeral_key';
  associated_objects: {
    type: 'customer';
    id: string;
  }[];
  created: number;
  expires: number;
  livemode: boolean;
  secret: string;
  apiVersion?: string;
} & StripeAccountIdOpt;

export type PresentPaymentOptionsResponse = {
  useGooglePay?: boolean;
  useApplePay?: boolean;
  paymentMethod?: PaymentMethod;
};

export type CustomerPaymentMethodsResponse = {
  paymentMethods: PaymentMethod[];
};

export interface StripePlugin {
  /* Core */
  setPublishableKey(opts: SetPublishableKeyOptions): Promise<void>;

  createCardToken(card: CardTokenRequest): Promise<CardTokenResponse>;

  createBankAccountToken(
    bankAccount: BankAccountTokenRequest,
  ): Promise<BankAccountTokenResponse>;

  /* Payment Intents */
  confirmPaymentIntent(
    opts: ConfirmPaymentIntentOptions,
  ): Promise<ConfirmPaymentIntentResponse>;

  confirmSetupIntent(
    opts: ConfirmSetupIntentOptions,
  ): Promise<ConfirmSetupIntentResponse>;

  /* Apple Pay */
  payWithApplePay(options: {
    applePayOptions: ApplePayOptions;
  }): Promise<ApplePayResponse>;

  cancelApplePay(): Promise<void>;

  finalizeApplePayTransaction(
    opts: FinalizeApplePayTransactionOptions,
  ): Promise<void>;

  /* Google Pay */
  payWithGooglePay(opts: {
    googlePayOptions: GooglePayOptions;
  }): Promise<GooglePayResponse>;

  /* Other tokens */
  createSourceToken(opts: CreateSourceTokenOptions): Promise<TokenResponse>;

  createPiiToken(opts: CreatePiiTokenOptions): Promise<TokenResponse>;

  createAccountToken(account: AccountParams): Promise<TokenResponse>;

  /* Payment methods */

  initCustomerSession(opts: InitCustomerSessionParams): Promise<void>;

  customerPaymentMethods(): Promise<CustomerPaymentMethodsResponse>;

  setCustomerDefaultSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse>;

  addCustomerSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse>;

  deleteCustomerSource(opts: {
    sourceId: string;
  }): Promise<CustomerPaymentMethodsResponse>;

  /* Helpers */
  customizePaymentAuthUI(opts: any): Promise<void>;

  presentPaymentOptions(): Promise<PresentPaymentOptionsResponse>;

  isApplePayAvailable(): Promise<AvailabilityResponse>;

  isGooglePayAvailable(): Promise<AvailabilityResponse>;

  validateCardNumber(
    opts: ValidateCardNumberOptions,
  ): Promise<ValidityResponse>;

  validateExpiryDate(
    opts: ValidateExpiryDateOptions,
  ): Promise<ValidityResponse>;

  validateCVC(opts: ValidateCVCOptions): Promise<ValidityResponse>;

  identifyCardBrand(opts: IdentifyCardBrandOptions): Promise<CardBrandResponse>;
}

export interface PaymentMethod {
  created?: number;
  customerId?: string;
  id?: string;
  livemode: boolean;
  type?: string;
  card?: Card;
}

export enum UIButtonType {
  SUBMIT = 'submit',
  CONTINUE = 'continue',
  NEXT = 'next',
  CANCEL = 'cancel',
  RESEND = 'resend',
  SELECT = 'select',
}

export interface UIButtonCustomizationOptions {
  type: UIButtonType;
  backgroundColor?: string;
  textColor?: string;
  fontName?: string;
  cornerRadius?: number;
  fontSize?: number;
}

export interface UICustomizationOptions {
  accentColor?: string;
  buttonCustomizations?: UIButtonCustomizationOptions[];
}

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

export interface TokenResponse {
  id: string;
  type: string;
  created: Date;
}

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

export enum SourceType {
  ThreeDeeSecure = '3ds',
  GiroPay = 'giropay',
  iDEAL = 'ideal',
  SEPADebit = 'sepadebit',
  Sofort = 'sofort',
  AliPay = 'alipay',
  AliPayReusable = 'alipayreusable',
  P24 = 'p24',
  VisaCheckout = 'visacheckout',
}

export enum CardBrand {
  AMERICAN_EXPRESS = 'American Express',
  DISCOVER = 'Discover',
  JCB = 'JCB',
  DINERS_CLUB = 'Diners Club',
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  UNIONPAY = 'UnionPay',
  UNKNOWN = 'Unknown',
}

// const SourceTypeArray: SourceType[] = Object.keys(SourceType).map((key: any) => SourceType[key] as any as SourceType);

export interface Address {
  line1: string;
  line2: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
}

export interface LegalEntity {
  address?: Address;
  dob?: {
    day: number;
    month: number;
    year: number;
  };
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female';
  personal_address?: Address;
  business_name?: string;
  business_url?: string;
  business_tax_id_provided?: boolean;
  business_vat_id_provided?: string;
  country?: string;
  tos_acceptance?: {
    date: number;
    ip: string;
  };
  personal_id_number_provided?: boolean;
  phone_number?: string;
  ssn_last_4_provided?: boolean;
  tax_id_registrar?: string;
  type?: 'individual' | 'company';
  verification?: IndividualVerification | CompanyVerification;
  external_accounts?: any;
}

export interface LegalEntityParams {
  type?: 'individual' | 'company';
  address?: Address;
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

export interface AccountParams extends StripeAccountIdOpt, IdempotencyKeyOpt {
  tosShownAndAccepted: boolean;
  legalEntity: CompanyLegalEntityParams | IndividualLegalEntityParams;
}

export interface Error {
  message: string;
}
