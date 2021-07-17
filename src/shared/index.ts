export interface CreatePaymentSheetOption {
  /**
   * Any documentation call 'paymentIntent'
   */
  paymentIntentClientSecret: string | undefined;

  /**
   * Any documentation call 'ephemeralKey'
   */
  customerEphemeralKeySecret: string | undefined;

  /**
   * Any documentation call 'customer'
   */
  customerId: string | undefined;

  /**
   * If you set payment method ApplePay, this set true
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   */
  useApplePay?: boolean;

  /**
   * If set useApplePay false, Plugin ignore here.
   */
  applePayMerchantId?: string;

  /**
   * If you set payment method GooglePay, this set true
   * @default false
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=android&ui=payment-sheet#google-pay
   */
  useGooglePay?: boolean;

  /**
   * @default false,
   */
  GooglePayIsTesting?: boolean;

  /**
   * use ApplePay and GooglePay.
   * If set useApplePay and useGooglePay false, Plugin ignore here.
   * @default "US"
   */
  countryCode?: string;

  /**
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default "App Name"
   */
  merchantDisplayName?: string | undefined;

  /**
   * iOS Only
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
   * @default undefined
   */
  style?: 'alwaysLight' | 'alwaysDark';
}

export interface CreateSetupIntentOption {
  setupIntentClientSecret: string;
}
