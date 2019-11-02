declare module '@capacitor/core' {
  interface PluginRegistry {
    StripePlugin: StripePluginPlugin;
  }
}

export interface StripePluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  /* Core */
  setPublishableKey(opts: {
    key: string
  }): Promise<void>;

  createCardToken(card: CardTokenRequest): Promise<CardTokenResponse>;

  createBankAccountToken(bankAccount: BankAccountTokenRequest): Promise<BankAccountTokenResponse>;

  /* Payment Intents */
  confirmPaymentIntent(opts: {
    clientSecret: string;
    saveMethod?: boolean;
    card?: Card;
    paymentMethodId?: string;
    redirectUrl: string;
  }): Promise<void>;

  /* Apple Pay */
  startApplyPayTransaction(options: ApplePayOptions): Promise<TokenResponse>;

  finalizeApplePayTransaction(opts: {
    paymentProcessed: boolean
  }): Promise<void>;

  /* Google Pay */
  startGooglePayTransaction(): Promise<void>;

  finalizeGooglePayTransaction(options: GooglePayOptions): Promise<TokenResponse>;

  /* Other tokens */
  createSourceToken(opts: {
    type: SourceType, params: SourceParams
  }): Promise<TokenResponse>;

  createPiiToken(opts: {
    pii: string
  }): Promise<TokenResponse>;

  createAccountToken(account: AccountParams): Promise<TokenResponse>;

  /* Helpers */
  validateCardNumber(opts: {
    cardNumber: string
  }): Promise<boolean>;

  validateExpiryDate(opts: {
    expMonth: number, expYear: number
  }): Promise<boolean>;

  validateCVC(opts: {
    cvc: string
  }): Promise<boolean>;

  identifyCardType(opts: {
    cardNumber: string
  }): Promise<string>;
}

export enum UIButtonType {
  SUBMIT = "submit",
  CONTINUE = "continue",
  NEXT = "next",
  CANCEL = "cancel",
  RESEND = "resend",
  SELECT = "select"
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
  id: string;
  object: string;
  address_city: any;
  address_country: any;
  address_line1: any;
  address_line1_check: any;
  address_line2: any;
  address_state: any;
  address_zip: any;
  address_zip_check: any;
  brand: string;
  country: string;
  cvc_check: any;
  dynamic_last4: any;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  last4: string;
  metadata: any;
  name: any;
  tokenization_method: any;
  phone: string;
  email: string;
}

export interface BankAccountTokenRequest {
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

export interface CardTokenRequest {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  postal_code?: string;
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

export interface ApplePayItem {
  label: string;
  amount: number | string;
}

export interface ApplePayOptions {
  merchantId: string;
  country: string;
  currency: string;
  items: ApplePayItem[];
}

export interface GooglePayOptions {
  amount: string;
  currencyCode: string;
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
  ThreeDeeSecureParams
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

const SourceTypeArray: SourceType[] = Object.keys(SourceType).map((key: any) => SourceType[key] as any as SourceType);

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
  },
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
  },
  personal_id_number_provided?: boolean;
  phone_number?: string;
  ssn_last_4_provided?: boolean;
  tax_id_registrar?: string;
  type?: 'individual' | 'company';
  verification?: any;
}

export interface AccountParams {
  tosShownAndAccepted: boolean;
  legalEntity: LegalEntity;
}

export interface Error {
  message: string;
}

export type BlankCallback = () => void;
export type ErrorCallback = (error: Error) => void;
export type CardTokenCallback = (token: CardTokenResponse) => void;
export type BankAccountTokenCallback = (token: BankAccountTokenResponse) => void;
