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
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default false
   */
  useApplePay?: boolean;

  applePayMerchantId?: string;

  applePayMerchantCountryCode?: string;

  /**
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet
   * @default "App Name"
   */
  merchantDisplayName?: string | undefined;

  /**
   * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
   * @default undefined
   */
  style?: 'alwaysLight' | 'alwaysDark';
}
