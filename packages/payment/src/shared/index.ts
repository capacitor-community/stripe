/**
 * @extends BasePaymentOption
 */
export interface CreatePaymentSheetOption extends BasePaymentOption {
  /**
   * Client secret of the PaymentIntent to confirm. Provide exactly one of
   * `paymentIntentClientSecret` or `setupIntentClientSecret`.
   *
   * @since 3.0.0
   */
  paymentIntentClientSecret?: string;

  /**
   * Client secret of the SetupIntent used to save a payment method. Provide
   * exactly one of `paymentIntentClientSecret` or
   * `setupIntentClientSecret`.
   *
   * @since 3.0.0
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
   *
   * @since 3.0.2
   */
  paymentIntentClientSecret?: string;

  /**
   * Client secret of the SetupIntent used to save a payment method. Provide
   * exactly one of `paymentIntentClientSecret` or
   * `setupIntentClientSecret`.
   *
   * @since 3.0.2
   */
  setupIntentClientSecret?: string;
}

/**
 * Billing details collection options.
 *
 * @since 7.2.0
 */
export type AddressCollectionMode = 'automatic' | 'full' | 'never';

/**
 * Billing details collection options.
 *
 * @since 5.4.0
 */
export type CollectionMode = 'automatic' | 'always' | 'never';

export interface Address {
  /**
   * Two-letter country code (ISO 3166-1 alpha-2).
   *
   * @since 7.2.0
   */
  country?: string;
  /**
   * City, district, suburb, town, or village.
   *
   * @since 7.2.0
   */
  city?: string;
  /**
   * Primary address line, such as a street address or post office box.
   *
   * @since 7.2.0
   */
  line1?: string;
  /**
   * Secondary address line, such as an apartment or suite.
   *
   * @since 7.2.0
   */
  line2?: string;
  /**
   * ZIP or postal code.
   *
   * @since 7.2.0
   */
  postalCode?: string;
  /**
   * State, county, province, or region.
   *
   * @since 7.2.0
   */
  state?: string;
}

export interface AddressDetails {
  /**
   * Recipient name.
   *
   * @since 7.2.0
   */
  name?: string;
  /**
   * Recipient postal address.
   *
   * @since 7.2.0
   */
  address?: Address;
  /**
   * Recipient phone number.
   *
   * @since 7.2.0
   */
  phone?: string;
  /**
   * Whether the customer selected the save-address checkbox. Android only.
   *
   * @since 7.2.0
   */
  isCheckboxSelected?: boolean;
}

export interface DefaultBillingDetails {
  /**
   * Prefilled billing email address.
   *
   * @since 7.2.0
   */
  email?: string;
  /**
   * Prefilled billing name.
   *
   * @since 7.2.0
   */
  name?: string;
  /**
   * Prefilled billing phone number.
   *
   * @since 7.2.0
   */
  phone?: string;
  /**
   * Prefilled billing address.
   *
   * @since 7.2.0
   */
  address?: Address;
}

/**
 * Controls which billing details PaymentSheet collects from the customer.
 *
 * @since 5.4.0
 */
interface BillingDetailsCollectionConfiguration {
  /**
   * Email collection mode.
   *
   * @since 5.4.0
   */
  email?: CollectionMode;
  /**
   * Name collection mode.
   *
   * @since 5.4.0
   */
  name?: CollectionMode;
  /**
   * Phone-number collection mode.
   *
   * @since 5.4.0
   */
  phone?: CollectionMode;
  /**
   * Postal-address collection mode.
   *
   * @since 5.4.0
   */
  address?: AddressCollectionMode;
}

export interface BasePaymentOption {
  /**
   * Billing details used to prefill PaymentSheet. iOS and Android only.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#set-default-billing-details
   *
   * @since 7.2.0
   */
  defaultBillingDetails?: DefaultBillingDetails;

  /**
   * Shipping details used to prefill PaymentSheet. Android only; on iOS use
   * Stripe's address element instead.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=android#prefill-addresses
   *
   * @since 7.2.0
   */
  shippingDetails?: AddressDetails;

  /**
   * Controls which billing details PaymentSheet collects. iOS and Android
   * only.
   *
   * https://docs.stripe.com/payments/mobile/collect-addresses?payment-ui=mobile&platform=ios#customize-billing-details-collection
   *
   * @since 7.2.0
   */
  billingDetailsCollectionConfiguration?: BillingDetailsCollectionConfiguration;

  /**
   * Customer ephemeral-key secret returned by your server. Use together with
   * `customerId`; do not provide only one of the pair.
   *
   * @since 3.0.0
   */
  customerEphemeralKeySecret?: string;

  /**
   * Stripe Customer ID associated with `customerEphemeralKeySecret`.
   *
   * @since 3.0.0
   */
  customerId?: string;

  /**
   * Enables Apple Pay in native PaymentSheet. iOS only.
   *
   * @default false
   * @since 3.3.0
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   */
  enableApplePay?: boolean;

  /**
   * Apple merchant identifier configured for the app. Required when
   * `enableApplePay` is true and ignored otherwise.
   *
   * @since 3.3.0
   */
  applePayMerchantId?: string;

  /**
   * Enables Google Pay in native PaymentSheet. Android only.
   *
   * @default false
   * @since 3.2.0
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#google-pay
   */
  enableGooglePay?: boolean;

  /**
   * Uses the Google Pay test environment. Android only.
   *
   * @default false
   * @since 3.2.0
   */
  GooglePayIsTesting?: boolean;

  /**
   * Two-letter ISO 3166-1 country code used by Apple Pay or Google Pay.
   * Ignored when neither wallet is enabled.
   *
   * @default "US"
   * @since 3.2.0
   */
  countryCode?: string;

  /**
   * Merchant name displayed in native PaymentSheet.
   *
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default "App Name"
   * @since 3.0.0
   */
  merchantDisplayName?: string | undefined;

  /**
   * Custom URL scheme used to return to the app after redirect-based
   * authentication. iOS only. Stripe may omit redirect-based payment methods
   * when this is not configured. Forward the returned URL to
   * `handleURLCallback` from the app URL handler.
   *
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#ios-set-up-return-url
   * @default ""
   * @since 3.0.0
   */
  returnURL?: string | undefined;

  /**
   * Layout used to display payment methods in PaymentSheet on iOS and Android.
   *
   * @url https://docs.stripe.com/payments/accept-a-payment?platform=android#android-customization
   * @default "automatic"
   * @since 7.2.2
   */
  paymentMethodLayout?: 'horizontal' | 'vertical' | 'automatic' | undefined;

  /**
   * Appearance override for native PaymentSheet. iOS only.
   *
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
   * @default undefined
   * @since 3.0.0
   */
  style?: 'alwaysLight' | 'alwaysDark';

  /**
   * Shows the ZIP-code field in the web card form. Web only.
   *
   * @default true
   * @since 3.6.0
   */
  withZipCode?: boolean;

  /**
   * Three-letter ISO 4217 currency code used by Google Pay. Required when
   * Google Pay is enabled for a SetupIntent.
   *
   * @default "USD"
   * @since 7.1.0
   */
  currencyCode?: string;
}

export interface PaymentSummaryItem {
  /**
   * Label shown for the line item in the Apple Pay sheet.
   *
   * @since 3.1.0
   */
  label: string;
  /**
   * Decimal amount in the currency's major unit, for example `10.99`.
   *
   * @since 3.1.0
   */
  amount: number;
}

export interface UpdateApplePaySheetOption {
  /**
   * Identifier received from the `DidSelectShippingContact` event.
   *
   * @since 8.2.0
   */
  updateId: string;
  /**
   * Replacement line items to display in the Apple Pay sheet.
   *
   * @since 8.2.0
   */
  paymentSummaryItems: PaymentSummaryItem[];
}

export interface CreateApplePayOption {
  /**
   * Client secret of the PaymentIntent to confirm with Apple Pay.
   *
   * @since 3.1.0
   */
  paymentIntentClientSecret: string;
  /**
   * Line items displayed in the Apple Pay sheet.
   *
   * @since 3.1.0
   */
  paymentSummaryItems: PaymentSummaryItem[];
  /**
   * Apple merchant identifier configured for the app.
   *
   * @since 3.1.0
   */
  merchantIdentifier: string;
  /**
   * Two-letter ISO 3166-1 country code for the payment request.
   *
   * @since 3.1.0
   */
  countryCode: string;
  /**
   * Three-letter ISO 4217 currency code for the payment request.
   *
   * @since 3.1.0
   */
  currency: string;
  /**
   * Shipping contact fields Apple Pay must collect. iOS only.
   *
   * @since 4.1.0
   */
  requiredShippingContactFields?: ('postalAddress' | 'phoneNumber' | 'emailAddress' | 'name')[];
  /**
   * Two-letter country codes accepted for shipping. iOS only.
   *
   * @since 5.4.3
   */
  allowedCountries?: string[];
  /**
   * Message shown when the selected shipping country is not allowed. iOS only.
   *
   * @since 5.4.3
   */
  allowedCountriesErrorDescription?: string;
}

export interface CreateGooglePayOption {
  /**
   * Client secret of the PaymentIntent to confirm with Google Pay.
   *
   * @since 3.2.0
   */
  paymentIntentClientSecret: string;

  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   *
   * @since 3.2.0
   */
  paymentSummaryItems?: {
    label: string;
    amount: number;
  }[];
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   *
   * @since 3.2.0
   */
  merchantIdentifier?: string;
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   *
   * @since 3.2.0
   */
  countryCode?: string;
  /**
   * Web only. Requires stripe-pwa-elements ^3.0.0.
   *
   * @since 3.2.0
   */
  currency?: string;
}

/**
 * Apple Pay shipping-contact data.
 *
 * @see https://developer.apple.com/documentation/passkit/pkcontact
 * @since 4.1.0
 */
export interface DidSelectShippingContact {
  /**
   * Shipping contact selected in Apple Pay.
   *
   * @since 4.1.0
   */
  contact: ShippingContact;
  /**
   * Identifier passed to `updateApplePaySheet()` for this callback.
   *
   * @since 4.1.0
   */
  updateId: string;
}
export interface DidCreatePaymentMethod {
  /**
   * Contact attached to the Apple Pay payment method.
   *
   * @since 4.1.0
   */
  contact: ShippingContact;
}
export interface ShippingContact {
  /**
   * Contact's given name. Apple Pay only.
   *
   * @since 4.1.0
   */
  givenName?: string;
  /**
   * Contact's family name. Apple Pay only.
   *
   * @since 4.1.0
   */
  familyName?: string;
  /**
   * Contact's middle name. Apple Pay only.
   *
   * @since 4.1.0
   */
  middleName?: string;
  /**
   * Contact's name prefix. Apple Pay only.
   *
   * @since 4.1.0
   */
  namePrefix?: string;
  /**
   * Contact's name suffix. Apple Pay only.
   *
   * @since 4.1.0
   */
  nameSuffix?: string;
  /**
   * Contact's formatted full name. Apple Pay only.
   *
   * @since 4.1.0
   */
  nameFormatted?: string;
  /**
   * Contact's phone number. Apple Pay only.
   *
   * @since 4.1.0
   */
  phoneNumber?: string;
  /**
   * Contact's nickname. Apple Pay only.
   *
   * @since 4.1.0
   */
  nickname?: string;
  /**
   * Street component of the contact's postal address. Apple Pay only.
   *
   * @since 4.1.0
   */
  street?: string;
  /**
   * City component of the contact's postal address. Apple Pay only.
   *
   * @since 4.1.0
   */
  city?: string;
  /**
   * State or province component of the contact's postal address. Apple Pay only.
   *
   * @since 4.1.0
   */
  state?: string;
  /**
   * Postal-code component of the contact's address. Apple Pay only.
   *
   * @since 4.1.0
   */
  postalCode?: string;
  /**
   * Country or region name in the contact's address. Apple Pay only.
   *
   * @since 4.1.0
   */
  country?: string;
  /**
   * ISO country code in the contact's address. Apple Pay only.
   *
   * @since 4.1.0
   */
  isoCountryCode?: string;
  /**
   * Sub-administrative area in the contact's address. Apple Pay only.
   *
   * @since 4.1.0
   */
  subAdministrativeArea?: string;
  /**
   * Sublocality in the contact's address. Apple Pay only.
   *
   * @since 4.1.0
   */
  subLocality?: string;
}
