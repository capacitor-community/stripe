declare module '@capacitor/core' {
  interface PluginRegistry {
    StripePlugin: StripePluginPlugin;
  }
}

export interface CommonIntentOptions {
  clientSecret: string;
  /**
   * If provided, the payment intent will be confirmed using this card as a payment method.
   */
  card?: Card;
  /**
   * If provided, the payment intent will be confirmed using this payment method
   */
  paymentMethodId?: string;
  redirectUrl: string;
}

export type ConfirmSetupIntentOptions = CommonIntentOptions;

export interface ConfirmPaymentIntentOptions extends CommonIntentOptions {
  /**
   * Whether you intend to save the payment method to the customer's account after this payment
   */
  saveMethod?: boolean;
  /**
   * If provided, the payment intent will be confirmed using a card provided by Apple Pay
   */
  applePayOptions?: ApplePayOptions;

  /**
   * If provided, the payment intent will be confirmed using a card provided by Google Pay
   */
  googlePayOptions?: GooglePayOptions;
}

export type SetPublishableKeyOptions = {
  key: string
};

export type ValidateCardNumberOptions = {
  number: string
};

export type ValidateExpiryDateOptions = {
  exp_month: number,
  exp_year: number
};

export type ValidateCVCOptions = {
  cvc: string
};

export type IdentifyCardBrandOptions = {
  number: string
};

export type CreatePiiTokenOptions = {
  pii: string
};

export type CreateSourceTokenOptions = {
  type: SourceType,
  params: SourceParams
};

export type FinalizeApplePayTransactionOptions = {
  success: boolean
};

export type ValidityResponse = { valid: boolean }
export type AvailabilityResponse = { available: boolean }

export type CardBrandResponse = { brand: CardBrand };

export interface StripePluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  /* Core */

  setPublishableKey(opts: SetPublishableKeyOptions): Promise<void>;

  createCardToken(card: CardTokenRequest): Promise<CardTokenResponse>;

  createBankAccountToken(bankAccount: BankAccountTokenRequest): Promise<BankAccountTokenResponse>;

  /* Payment Intents */
  confirmPaymentIntent(opts: ConfirmPaymentIntentOptions): Promise<void>;

  confirmSetupIntent(opts: ConfirmSetupIntentOptions): Promise<void>;

  /* Apple Pay */
  payWithApplePay(options: ApplePayOptions): Promise<TokenResponse>;

  cancelApplePay(): Promise<void>;

  finalizeApplePayTransaction(opts: FinalizeApplePayTransactionOptions): Promise<void>;

  /* Google Pay */
  startGooglePayTransaction(): Promise<void>;

  /* Other tokens */
  createSourceToken(opts: CreateSourceTokenOptions): Promise<TokenResponse>;

  createPiiToken(opts: CreatePiiTokenOptions): Promise<TokenResponse>;

  createAccountToken(account: AccountParams): Promise<TokenResponse>;

  /* Payment methods */

  initCustomerSession(opts: {
    id: string;
    object: 'ephemeral_key';
    associated_objects: Array<{
      type: 'customer';
      id: string;
    }>;
    created: number;
    expires: number;
    livemode: boolean;
    secret: string;
    apiVersion?: string;
  }): Promise<void>;

  customerPaymentMethods(): Promise<PaymentMethod[]>;

  setCustomerDefaultSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<void>;

  addCustomerSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<void>;

  deleteCustomerSource(opts: { sourceId: string }): Promise<void>;

  /* Helpers */
  customizePaymentAuthUI(opts: any): Promise<void>;

  isApplePayAvailable(): Promise<AvailabilityResponse>;

  isGooglePayAvailable(): Promise<AvailabilityResponse>;

  validateCardNumber(opts: ValidateCardNumberOptions): Promise<ValidityResponse>;

  validateExpiryDate(opts: ValidateExpiryDateOptions): Promise<ValidityResponse>;

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
  SELECT = 'select'
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
  brand: CardBrand;
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
  allowedCardNetworks: CardBrand[];
  allowedAuthMethods: Array<'PAN_ONLY' | 'CRYPTOGRAM_3DS'>;
  totalPrice: string;
  totalPriceStatus: 'final';
  currencyCode: string;
  merchantName: string;
  emailRequired?: boolean;
  allowPrepaidCards?: boolean;
  billingAddressRequired?: boolean;
  billingAddressParams?: {
    format?: 'MIN'; // TODO copy from google
    phoneNumberRequired?: boolean;
  }
  shippingAddressRequired?: boolean;
  shippingAddressParameters?: {
    // TODO copy form google
  };
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

export enum CardBrand {
  AMERICAN_EXPRESS = 'AMERICAN_EXPRESS',
  DISCOVER = 'DISCOVER',
  JCB = 'JCB',
  DINERS_CLUB = 'DINERS_CLUB',
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  UNIONPAY = 'UNIONPAY',
  UNKNOWN = 'UNKNOWN'
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
