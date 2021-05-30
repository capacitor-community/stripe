declare module '@capacitor/core' {
  interface PluginRegistry {
    Stripe: StripePlugin;
  }
}

export type StripeAccountIdOpt = {
  /**
   * Optional
   * Used on Android only
   */
  stripeAccountId?: string;
}

export type IdempotencyKeyOpt = {
  /**
   * Optional
   * Used on Android only
   */
  idempotencyKey?: string;
}

export interface CommonIntentOptions extends StripeAccountIdOpt {
  clientSecret: string;

  /**
   * If provided, the payment intent will be confirmed using this card as a payment method.
   */
  card?: CardTokenRequest;

  /**
   * If provided, the payment intent will be confirmed using this payment method
   */
  paymentMethodId?: string;

  /**
   * Optional
   * Used for Webview based 3DS authentication
   */
  redirectUrl?: string;
}

export interface ConfirmSetupIntentOptions extends CommonIntentOptions {
  id: string;
}

export interface ConfirmPaymentIntentOptions extends CommonIntentOptions {
  /**
     * Indicates that you intend to make future payments with this PaymentIntent's payment method.
     *
     * If present, the payment method used with this PaymentIntent can be [attached](https://stripe.com/docs/api/payment_methods/attach) to a Customer, even after the transaction completes.
     *
     * Use `on_session` if you intend to only reuse the payment method when your customer is present in your checkout flow. Use `off_session` if your customer may or may not be in your checkout flow.
     *
     * Stripe uses `setup_future_usage` to dynamically optimize your payment flow and comply with regional legislation and network rules. For example, if your customer is impacted by [SCA](https://stripe.com/docs/strong-customer-authentication), using `off_session` will ensure that they are authenticated while processing this PaymentIntent. You will then be able to collect [off-session payments](https://stripe.com/docs/payments/cards/charging-saved-cards#off-session-payments-with-saved-cards) for this customer.
     *
     * If `setup_future_usage` is already set and you are performing a request using a publishable key, you may only update the value from `on_session` to `off_session`.
     */
  setupFutureUsage?: 'on_session' | 'off_session'
  /**
   * Whether you intend to save the payment method to the customer's account after this payment
   */
  saveMethod?: boolean;

  /**
   * If provided, the payment intent will be confirmed using Apple Pay
   */
  applePayOptions?: ApplePayOptions;

  /**
   * If provided, the payment intent will be confirmed using Google Pay
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
} & StripeAccountIdOpt & IdempotencyKeyOpt ;

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


export enum GooglePayAuthMethod {
  /**
   * This authentication method is associated with payment cards stored on file with the user's Google Account.
   * Returned payment data includes personal account number (PAN) with the expiration month and the expiration year.
   */
  PAN_ONLY = 'PAN_ONLY',
  /**
   * This authentication method is associated with cards stored as Android device tokens.
   * Returned payment data includes a 3-D Secure (3DS) cryptogram generated on the device.
   */
  CRYPTOGRAM_3DS = 'CRYPTOGRAM_3DS'
}

export type InitCustomerSessionParams = {
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
} & StripeAccountIdOpt;

export type PresentPaymentOptionsResponse = { useGooglePay?: boolean; useApplePay?: boolean; paymentMethod?: PaymentMethod; };

export type CustomerPaymentMethodsResponse = {
  paymentMethods: PaymentMethod[]
};

export interface ConfirmPaymentIntentResponse {
  amount: number;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  cad: string;
  livemode: boolean;
  object: string;
  payment_method: PaymentMethod;
  payment_method_types: string[];
  status: string;
}

export interface ConfirmSetupIntentResponse {
  /**
   * Unix timestamp representing creation time
   */
  created: number;
  /**
   * Setup intent ID
   */
  id: string;
  /**
   * Whether the setup intent was created in live mode
   */
  isLiveMode: boolean;
  /**
   * Payment method ID
   */
  paymentMethodId: string;
  status: string;
  usage: string;
}

export interface StripePlugin {
  /* Core */
  setPublishableKey(opts: SetPublishableKeyOptions): Promise<void>;

  createCardToken(card: CardTokenRequest): Promise<CardTokenResponse>;

  createBankAccountToken(bankAccount: BankAccountTokenRequest): Promise<BankAccountTokenResponse>;

  /* Payment Intents */
  confirmPaymentIntent(opts: ConfirmPaymentIntentOptions): Promise<ConfirmPaymentIntentResponse>;

  confirmSetupIntent(opts: ConfirmSetupIntentOptions): Promise<ConfirmSetupIntentResponse>;

  /* Apple Pay */
  payWithApplePay(options: { applePayOptions: ApplePayOptions }): Promise<ApplePayResponse>;

  cancelApplePay(): Promise<void>;

  finalizeApplePayTransaction(opts: FinalizeApplePayTransactionOptions): Promise<void>;

  /* Google Pay */
  payWithGooglePay(opts: { googlePayOptions: GooglePayOptions }): Promise<GooglePayResponse>;

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

  deleteCustomerSource(opts: { sourceId: string }): Promise<CustomerPaymentMethodsResponse>;

  /* Helpers */
  customizePaymentAuthUI(opts: any): Promise<void>;

  presentPaymentOptions(): Promise<PresentPaymentOptionsResponse>

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
  /**
   * Id exists for cards but not payment methods
   */
  id?: string;
  brand: CardBrand;
  country: string;
  cvc_check: any;
  three_d_secure_usage?: {
    supported: boolean;
  }
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

export interface BankAccountTokenRequest extends StripeAccountIdOpt, IdempotencyKeyOpt {
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

export interface CardTokenRequest extends StripeAccountIdOpt, IdempotencyKeyOpt {
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

export interface ApplePayResponse {
  token: string;
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

  billingEmailAddress?: boolean;
  billingName?: boolean;
  billingPhoneNumber?: boolean;
  billingPhoneticName?: boolean;
  billingPostalAddress?: boolean;

  shippingEmailAddress?: boolean;
  shippingName?: boolean;
  shippingPhoneNumber?: boolean;
  shippingPhoneticName?: boolean;
  shippingPostalAddress?: boolean;
}

export interface GooglePayResponse {
  success: boolean;
  token: {
    apiVersionMinor: number;
    apiVersion: number;
    paymentMethodData: {
      description: string;
      tokenizationData: {
        type: string;
        /**
         * The "token" is a JSON string of a TokenResponse.
         * So please use `JSON.parse(token)`!
         * {
         *   "id": "tok_123...",
         *   "object": "token",
         *   "card": {
         *     "id": "card_123...",
         *     "object": "card",
         *     "address_city": null,
         *     "address_country": null,
         *     "address_line1": null,
         *     "address_line1_check": null,
         *     "address_line2": null,
         *     "address_state": null,
         *     "address_zip": null,
         *     "address_zip_check": null,
         *     "brand": "MasterCard",
         *     "country": "US",
         *     "cvc_check": null,
         *     "dynamic_last4": "4242",
         *     "exp_month": 12,
         *     "exp_year": 2025,
         *     "funding": "credit",
         *     "last4": "6933",
         *     "metadata": {
         *     },
         *     "name": "Patrick ...",
         *     "tokenization_method": "android_pay"
         *   },
         *   "client_ip": "123.123.123.123",
         *   "created": 1234567890,
         *   "livemode": false,
         *   "type": "card",
         *   "used": false
         * }
         */
        token: string;
      };
      type: string;
      info: {
        cardNetwork: string;
        cardDetails: string;
        /**
         * `billingAddress` is only set when `billingAddressRequired` was set to `true`
         */
        billingAddress?: {
          countryCode: string;
          postalCode: string;
          name: string;
        };
      };
    };
    /**
     * `shippingAddress` is only set when `shippingAddressRequired` was set to `true`
     */
    shippingAddress?: {
      address3: string;
      sortingCode: string;
      address2: string;
      countryCode: string;
      address1: string;
      postalCode: string;
      name: string;
      locality: string;
      administrativeArea: string;
    };
    /**
     * `email` is only set when `emailRequired` was set to `true`
     */
    email?: string;
  };
}

export enum GooglePayPriceStatus {
  /**
   * Used for a capability check. Do not use this property if the transaction is processed in an EEA country.
   */
  NOT_CURRENTLY_KNOWN = 'NOT_CURRENTLY_KNOWN',
  /**
   * Total price may adjust based on the details of the response, such as sales tax collected based on a billing address.
   */
  ESTIMATED = 'ESTIMATED',
  /**
   * Total price doesn't change from the amount presented to the shopper.
   */
  FINAL = 'FINAL'
}

export enum GooglePayCheckoutOption {
  /**
   * Standard text applies for the given totalPriceStatus (default).
   */
  DEFAULT = 'DEFAULT',
  /**
   * The selected payment method is charged immediately after the payer confirms their selections.
   * This option is only available when `totalPriceStatus` is set to `FINAL`.
   */
  COMPLETE_IMMEDIATE_PURCHASE = 'COMPLETE_IMMEDIATE_PURCHASE'
}

export enum GooglePayBillingAddressFormat {
  /**
   * Name, country code, and postal code (default).
   */
  MIN = 'MIN',
  /**
   *  Name, street address, locality, region, country code, and postal code.
   */
  FULL = 'FULL'
}

export interface GooglePayOptions {
  /**
   * Merchant name encoded as UTF-8.
   * Merchant name is rendered in the payment sheet.
   * In TEST environment, or if a merchant isn't recognized, a “Pay Unverified Merchant” message is displayed in the payment sheet.
   */
  merchantName?: string;

  /**
   * Total monetary value of the transaction with an optional decimal precision of two decimal places.
   */
  totalPrice: string;
  /**
   * The status of the total price used
   */
  totalPriceStatus: GooglePayPriceStatus;
  /**
   * Custom label for the total price within the display items.
   */
  totalPriceLabel?: string;
  /**
   * Affects the submit button text displayed in the Google Pay payment sheet.
   */
  checkoutOption?: 'DEFAULT' | 'COMPLETE_IMMEDIATE_PURCHASE';
  /**
   * A unique ID that identifies a transaction attempt.
   * Merchants may use an existing ID or generate a specific one for Google Pay transaction attempts.
   * This field is required when you send callbacks to the Google Transaction Events API.
   */
  transactionId?: string;
  /**
   * ISO 4217 alphabetic currency code.
   */
  currencyCode: string;
  /**
   * ISO 3166-1 alpha-2 country code where the transaction is processed.
   * This is required for merchants based in European Economic Area (EEA) countries.
   */
  countryCode?: string;

  /**
   * Fields supported to authenticate a card transaction.
   */
  allowedAuthMethods: GooglePayAuthMethod[];

  /**
   * One or more card networks that you support, also supported by the Google Pay API.
   */
  allowedCardNetworks: Array<'AMEX' | 'DISCOVER' | 'INTERAC' | 'JCB' | 'MASTERCARD' | 'VISA'>;

  /**
   * Set to false if you don't support prepaid cards.
   * Default: The prepaid card class is supported for the card networks specified.
   */
  allowPrepaidCards?: boolean;

  /**
   * Set to true to request an email address.
   */
  emailRequired?: boolean;

  /**
   * Set to true if you require a billing address.
   * A billing address should only be requested if it's required to process the transaction.
   * Additional data requests can increase friction in the checkout process and lead to a lower conversion rate.
   */
  billingAddressRequired?: boolean;

  billingAddressParameters?: {
    /**
     * Billing address format required to complete the transaction.
     */
    format?: GooglePayBillingAddressFormat;
    /**
     * Set to true if a phone number is required to process the transaction.
     */
    phoneNumberRequired?: boolean;
  }

  /**
   * Set to true to request a full shipping address.
   */
  shippingAddressRequired?: boolean;

  shippingAddressParameters?: {
    /**
     * ISO 3166-1 alpha-2 country code values of the countries where shipping is allowed.
     * If this object isn't specified, all shipping address countries are allowed.
     */
    allowedCountryCodes?: string[];
    /**
     * Set to true if a phone number is required for the provided shipping address.
     */
    phoneNumberRequired?: boolean;
  }
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
  AMERICAN_EXPRESS = 'American Express',
  DISCOVER = 'Discover',
  JCB = 'JCB',
  DINERS_CLUB = 'Diners Club',
  VISA = 'Visa',
  MASTERCARD = 'MasterCard',
  UNIONPAY = 'UnionPay',
  UNKNOWN = 'Unknown'
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

export interface IndividualVerificationDocument {
  front?: string;
  back?: string;
  details_code: 'document_corrupt' | 'document_country_not_supported' | 'document_expired' | 'document_failed_copy' | 'document_failed_other' | 'document_failed_test_mode' | 'document_fraudulent' | 'document_failed_greyscale' | 'document_incomplete' | 'document_invalid' | 'document_manipulated' | 'document_missing_back' | 'document_missing_front' | 'document_not_readable' | 'document_not_uploaded' | 'document_photo_mismatch' | 'document_too_large' | 'document_type_not_supported'
}

export interface IndividualVerification {
  status: 'unverified' | 'pending' | 'verified';
  details: string;
  details_code: 'document_address_mismatch' | 'document_dob_mismatch' | 'document_duplicate_type' | 'document_id_number_mismatch' | 'document_name_mismatch' | 'document_nationality_mismatch' | 'failed_keyed_identity' | 'failed_other';
  document: IndividualVerificationDocument;
  additional_document?: IndividualVerificationDocument;
}

export interface CompanyVerificationDocument {
  front?: string;
  back?: string;
  details: string;
  details_code: 'document_corrupt' | 'document_country_not_supported' | 'document_expired' | 'document_failed_copy' | 'document_failed_other' | 'document_failed_test_mode' | 'document_fraudulent' | 'document_failed_greyscale' | 'document_incomplete' | 'document_invalid' | 'document_manipulated' | 'document_missing_back' | 'document_missing_front' | 'document_not_readable' | 'document_not_uploaded' | 'document_photo_mismatch' | 'document_too_large' | 'document_type_not_supported'
}

export interface CompanyVerification {
  document: CompanyVerificationDocument;
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
  verification?: IndividualVerification | CompanyVerification;
  external_accounts?: any;
}

export interface LegalEntityParams {
  type: 'individual' | 'company';
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
  type: 'company';

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
