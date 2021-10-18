export interface CreatePaymentSheetOption extends BasePaymentOption {
    /**
     * Any documentation call 'paymentIntent'
     */
    paymentIntentClientSecret: string;
}
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
export interface BasePaymentOption {
    /**
     * Any documentation call 'ephemeralKey'
     */
    customerEphemeralKeySecret?: string;
    /**
     * Any documentation call 'customer'
     */
    customerId: string;
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
     * iOS Only
     * @url https://stripe.com/docs/payments/accept-a-payment?platform=ios&ui=payment-sheet#userinterfacestyle
     * @default undefined
     */
    style?: 'alwaysLight' | 'alwaysDark';
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
}
export interface CreateGooglePayOption {
    paymentIntentClientSecret: string;
}
