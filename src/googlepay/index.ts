import { GooglePayBillingAddressFormat, GooglePayAuthMethod, GooglePayPriceStatus } from './enum';

export interface GooglePayDefinitions {
  isGooglePayAvailable(): Promise<void>;

  payWithGooglePay(opts: {
    googlePayOptions: GooglePayOptions;
  }): Promise<GooglePayResponse>;
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
  allowedCardNetworks: (
    | 'AMEX'
    | 'DISCOVER'
    | 'INTERAC'
    | 'JCB'
    | 'MASTERCARD'
    | 'VISA'
    )[];

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
  };

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
  };
}



