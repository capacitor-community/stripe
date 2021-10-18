import { WebPlugin } from '@capacitor/core';
import type { StripeInitializationOptions, StripePlugin, CreatePaymentSheetOption, PaymentSheetResultInterface, CreatePaymentFlowOption, PaymentFlowResultInterface, ApplePayResultInterface, GooglePayResultInterface } from './definitions';
export declare class StripeWeb extends WebPlugin implements StripePlugin {
    private publishableKey;
    private paymentSheet;
    private flowStripe;
    private flowCardNumberElement;
    constructor();
    initialize(options: StripeInitializationOptions): Promise<void>;
    createPaymentSheet(options: CreatePaymentSheetOption): Promise<void>;
    presentPaymentSheet(): Promise<{
        paymentResult: PaymentSheetResultInterface;
    }>;
    createPaymentFlow(options: CreatePaymentFlowOption): Promise<void>;
    presentPaymentFlow(): Promise<{
        cardNumber: string;
    }>;
    confirmPaymentFlow(): Promise<{
        paymentResult: PaymentFlowResultInterface;
    }>;
    isApplePayAvailable(): Promise<void>;
    createApplePay(): Promise<void>;
    presentApplePay(): Promise<{
        paymentResult: ApplePayResultInterface;
    }>;
    isGooglePayAvailable(): Promise<void>;
    createGooglePay(): Promise<void>;
    presentGooglePay(): Promise<{
        paymentResult: GooglePayResultInterface;
    }>;
}
