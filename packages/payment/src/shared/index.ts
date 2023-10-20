/**
 * @extends BasePaymentOption
 */
export interface CreatePaymentSheetOption extends BasePaymentOption {
  /**
   * Any documentation call 'paymentIntent'
   * Set paymentIntentClientSecret or setupIntentClientSecret
   */
  paymentIntentClientSecret?: string;

  /**
   * Any documentation call 'paymentIntent'
   * Set paymentIntentClientSecret or setupIntentClientSecret
   */
  setupIntentClientSecret?: string;
}

/**
 * @extends BasePaymentOption
 */
export interface CreatePaymentFlowOption extends BasePaymentOption {
  /**
   * Any documentation call 'paymentIntent'
   * Set paymentIntentClientSecret or setupIntentClientSecret
   */
  paymentIntentClientSecret?: string;

  /**
   * Any documentation call 'paymentIntent'
   * Set paymentIntentClientSecret or setupIntentClientSecret
   */
  setupIntentClientSecret?: string;
}

/**
 * Billing details collection options.
 */
export type AddressCollectionMode = 'automatic' | 'full';

/**
 * Billing details collection options.
 */
export type CollectionMode = 'automatic' | 'always';

interface BillingDetailsCollectionConfiguration {
  /**
   * Configuration for how billing details are collected during checkout.
   */
  email?: CollectionMode,
  name?: CollectionMode,
  phone?: CollectionMode,
  address?: AddressCollectionMode
}

export interface BasePaymentOption {
  /**
   * Optional billingDetailsCollectionConfiguration
   */
  billingDetailsCollectionConfiguration?: BillingDetailsCollectionConfiguration;

  /**
   * Any documentation call 'ephemeralKey'
   */
  customerEphemeralKeySecret?: string;

  /**
   * Any documentation call 'customer'
   */
  customerId?: string;

  /**
   * If you set payment method ApplePay, this set true
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   */
  enableApplePay?: boolean;

  /**
   * If set enableApplePay false, Plugin ignore here.
   */
  applePayMerchantId?: string;

  /**
   * If you set payment method GooglePay, this set true
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#google-pay
   */
  enableGooglePay?: boolean;

  /**
   * @default false,
   */
  GooglePayIsTesting?: boolean;

  /**
   * use ApplePay and GooglePay.
   * If set enableApplePay and enableGooglePay false, Plugin ignore here.
   * @default "US"
   */
  countryCode?: string;

  /**
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default "App Name"
   */
  merchantDisplayName?: string | undefined;

  /**
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-set-up-return-url
   * @default ""
   */
  returnURL?: string | undefined;

  /**
   * iOS Only
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
   * @default undefined
   */
  style?: 'alwaysLight' | 'alwaysDark';

  /**
   * Platform: Web only
   * Show ZIP code field.
   * @default true
   */
  withZipCode?: boolean
}

export interface CreateApplePayOption {
  paymentIntentClientSecret: string;
  paymentSummaryItems: {
    label: string;
    amount: number;
  }[];
  merchantIdentifier: string;
  countryCode: string;
  currency: string;
  requiredShippingContactFields?: ('postalAddress' | 'phoneNumber' | 'emailAddress' | 'name')[];
}

export interface CreateGooglePayOption {
  paymentIntentClientSecret: string;

  /**
   * Web only
   * need stripe-pwa-elements > 1.1.0
   */
  paymentSummaryItems?: {
    label: string;
    amount: number;
  }[];
  /**
   * Web only
   * need stripe-pwa-elements > 1.1.0
   */
  merchantIdentifier?: string;
  /**
   * Web only
   * need stripe-pwa-elements > 1.1.0
   */
  countryCode?: string;
  /**
   * Web only
   * need stripe-pwa-elements > 1.1.0
   */
  currency?: string;
}

// Apple doc: https://developer.apple.com/documentation/passkit/pkcontact
export interface DidSelectShippingContact {
  contact: ShippingContact;
}
export interface ShippingContact {
  /**
   * Apple Pay only
   */
  givenName?: string;
  /**
   * Apple Pay only
   */
  familyName?: string;
  /**
   * Apple Pay only
   */
  middleName?: string;
  /**
   * Apple Pay only
   */
  namePrefix?: string;
  /**
   * Apple Pay only
   */
  nameSuffix?: string;
  /**
   * Apple Pay only
   */
  nameFormatted?: string;
  /**
   * Apple Pay only
   */
  phoneNumber?: string;
  /**
   * Apple Pay only
   */
  nickname?: string;
  /**
   * Apple Pay only
   */
  street?: string;
  /**
   * Apple Pay only
   */
  city?: string;
  /**
   * Apple Pay only
   */
  state?: string;
  /**
   * Apple Pay only
   */
  postalCode?: string;
  /**
   * Apple Pay only
   */
  country?: string;
  /**
   * Apple Pay only
   */
  isoCountryCode?: string;
  /**
   * Apple Pay only
   */
  subAdministrativeArea?: string;
  /**
   * Apple Pay only
   */
  subLocality?: string;
}
