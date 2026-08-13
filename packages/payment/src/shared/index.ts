/**
 * @extends BasePaymentOption
 */
export interface CreatePaymentSheetOption extends BasePaymentOption {
  /**
   * Client secret of the PaymentIntent to confirm. Provide exactly one of
   * `paymentIntentClientSecret` or `setupIntentClientSecret`.
   */
  paymentIntentClientSecret?: string;

  /**
   * Client secret of the SetupIntent used to save a payment method. Provide
   * exactly one of `paymentIntentClientSecret` or
   * `setupIntentClientSecret`.
   */
  setupIntentClientSecret?: string;
}

/**
 * @extends BasePaymentOption
 */
export interface CreatePaymentFlowOption extends BasePaymentOption {
  /**
   * Client secret of the PaymentIntent to confirm. Provide exactly one of
   * `paymentIntentClientSecret` or `setupIntentClientSecret`.
   */
  paymentIntentClientSecret?: string;

  /**
   * Client secret of the SetupIntent used to save a payment method. Provide
   * exactly one of `paymentIntentClientSecret` or
   * `setupIntentClientSecret`.
   */
  setupIntentClientSecret?: string;
}

/**
 * Billing details collection options.
 */
export type AddressCollectionMode = 'automatic' | 'full' | 'never';

/**
 * Billing details collection options.
 */
export type CollectionMode = 'automatic' | 'always' | 'never';

export interface Address {
  /**
   * Two-letter country code (ISO 3166-1 alpha-2).
   */
  country?: string;
  /** City, district, suburb, town, or village. */
  city?: string;
  /** Primary address line, such as a street address or post office box. */
  line1?: string;
  /** Secondary address line, such as an apartment or suite. */
  line2?: string;
  /** ZIP or postal code. */
  postalCode?: string;
  /** State, county, province, or region. */
  state?: string;
}

export interface AddressDetails {
  /** Recipient name. */
  name?: string;
  /** Recipient postal address. */
  address?: Address;
  /** Recipient phone number. */
  phone?: string;
  /** Whether the customer selected the save-address checkbox. Android only. */
  isCheckboxSelected?: boolean;
}

export interface DefaultBillingDetails {
  /** Prefilled billing email address. */
  email?: string;
  /** Prefilled billing name. */
  name?: string;
  /** Prefilled billing phone number. */
  phone?: string;
  /** Prefilled billing address. */
  address?: Address;
}

/** Controls which billing details PaymentSheet collects from the customer. */
interface BillingDetailsCollectionConfiguration {
  /**
   * Email collection mode.
   */
  email?: CollectionMode;
  /** Name collection mode. */
  name?: CollectionMode;
  /** Phone-number collection mode. */
  phone?: CollectionMode;
  /** Postal-address collection mode. */
  address?: AddressCollectionMode;
}

export interface BasePaymentOption {
  /**
   * Billing details used to prefill PaymentSheet. iOS and Android only.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details
   */
  defaultBillingDetails?: DefaultBillingDetails;

  /**
   * Shipping details used to prefill PaymentSheet. Android only; on iOS use
   * Stripe's address element instead.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses
   */
  shippingDetails?: AddressDetails;

  /**
   * Controls which billing details PaymentSheet collects. iOS and Android
   * only.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection
   */
  billingDetailsCollectionConfiguration?: BillingDetailsCollectionConfiguration;

  /**
   * Customer ephemeral-key secret returned by your server. Use together with
   * `customerId`; do not provide only one of the pair.
   */
  customerEphemeralKeySecret?: string;

  /**
   * Stripe Customer ID associated with `customerEphemeralKeySecret`.
   */
  customerId?: string;

  /**
   * Enables Apple Pay in native PaymentSheet. iOS only.
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   */
  enableApplePay?: boolean;

  /**
   * Apple merchant identifier configured for the app. Required when
   * `enableApplePay` is true and ignored otherwise.
   */
  applePayMerchantId?: string;

  /**
   * Enables Google Pay in native PaymentSheet. Android only.
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#google-pay
   */
  enableGooglePay?: boolean;

  /**
   * Uses the Google Pay test environment. Android only.
   * @default false
   */
  GooglePayIsTesting?: boolean;

  /**
   * Two-letter ISO 3166-1 country code used by Apple Pay or Google Pay.
   * Ignored when neither wallet is enabled.
   * @default "US"
   */
  countryCode?: string;

  /**
   * Merchant name displayed in native PaymentSheet.
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default "App Name"
   */
  merchantDisplayName?: string | undefined;

  /**
   * Custom URL scheme used to return to the app after redirect-based
   * authentication. iOS only.
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-set-up-return-url
   * @default ""
   */
  returnURL?: string | undefined;

  /**
   * Layout used to display payment methods in PaymentSheet on iOS and Android.
   * @url https://docs.stripe.com/payments/accept-a-payment?platform=android#android-customization
   * @default "automatic"
   */
  paymentMethodLayout?: 'horizontal' | 'vertical' | 'automatic' | undefined;

  /**
   * Appearance override for native PaymentSheet. iOS only.
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
   * @default undefined
   */
  style?: 'alwaysLight' | 'alwaysDark';

  /**
   * Shows the ZIP-code field in the web card form. Web only.
   * @default true
   */
  withZipCode?: boolean;

  /**
   * Three-letter ISO 4217 currency code used by Google Pay. Required when
   * Google Pay is enabled for a SetupIntent.
   * @default "USD"
   */
  currencyCode?: string;
}

export interface PaymentSummaryItem {
  /** Label shown for the line item in the Apple Pay sheet. */
  label: string;
  /** Decimal amount in the currency's major unit, for example `10.99`. */
  amount: number;
}

export interface UpdateApplePaySheetOption {
  /** Identifier received from the `DidSelectShippingContact` event. */
  updateId: string;
  /** Replacement line items to display in the Apple Pay sheet. */
  paymentSummaryItems: PaymentSummaryItem[];
}

export interface CreateApplePayOption {
  /** Client secret of the PaymentIntent to confirm with Apple Pay. */
  paymentIntentClientSecret: string;
  /** Line items displayed in the Apple Pay sheet. */
  paymentSummaryItems: PaymentSummaryItem[];
  /** Apple merchant identifier configured for the app. */
  merchantIdentifier: string;
  /** Two-letter ISO 3166-1 country code for the payment request. */
  countryCode: string;
  /** Three-letter ISO 4217 currency code for the payment request. */
  currency: string;
  /** Shipping contact fields Apple Pay must collect. iOS only. */
  requiredShippingContactFields?: ('postalAddress' | 'phoneNumber' | 'emailAddress' | 'name')[];
  /** Two-letter country codes accepted for shipping. iOS only. */
  allowedCountries?: string[];
  /** Message shown when the selected shipping country is not allowed. iOS only. */
  allowedCountriesErrorDescription?: string;
}

export interface CreateGooglePayOption {
  /** Client secret of the PaymentIntent to confirm with Google Pay. */
  paymentIntentClientSecret: string;

  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   */
  paymentSummaryItems?: {
    label: string;
    amount: number;
  }[];
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   */
  merchantIdentifier?: string;
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   */
  countryCode?: string;
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   */
  currency?: string;
}

// Apple doc: https://developer.apple.com/documentation/passkit/pkcontact
export interface DidSelectShippingContact {
  /** Shipping contact selected in Apple Pay. */
  contact: ShippingContact;
  /** Identifier passed to `updateApplePaySheet()` for this callback. */
  updateId: string;
}
export interface DidCreatePaymentMethod {
  /** Contact attached to the Apple Pay payment method. */
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
