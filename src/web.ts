import { WebPlugin } from '@capacitor/core';
import type { Stripe } from '@stripe/stripe-js';

import type {
  ApplePayOptions,
  ApplePayResponse,
  FinalizeApplePayTransactionOptions,
  GooglePayOptions,
  GooglePayResponse,
  StripeInitializationOptions,
  StripePlugin,
  CreatePaymentSheetOption,
} from './definitions';

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private paymentSheetSettings: CreatePaymentSheetOption = {
    paymentIntentUrl: undefined,
    customerUrl: undefined,
  };
  private stripe: Stripe | undefined;

  constructor() {
    super({
      name: 'Stripe',
      platforms: ['web'],
    });

    // will remove
    console.log(this.publishableKey);
    console.log(this.stripe);
  }

  async initialize(options: StripeInitializationOptions): Promise<void> {
    if (
      typeof options.publishableKey !== 'string' ||
      options.publishableKey.trim().length === 0
    ) {
      throw new Error('you must provide a valid key');
    }
    this.publishableKey = options.publishableKey;
  }

  async createPaymentSheet(options: CreatePaymentSheetOption): Promise<void> {
    this.paymentSheetSettings = options;
    return;
  }

  async presentPaymentSheet(): Promise<void> {
    const paymentSheetDOM = document.createElement('stripe-checkout') as any;
    paymentSheetDOM.publishableKey = this.publishableKey;
    paymentSheetDOM.paymentIntent = this.paymentSheetSettings.paymentIntentUrl;
    paymentSheetDOM.customer = this.paymentSheetSettings.customerUrl;
    document.body.appendChild(paymentSheetDOM);
    return;
  }

  isApplePayAvailable(): Promise<void> {
    return new Promise(reject => reject());
  }

  async payWithApplePay(options: {
    applePayOptions: ApplePayOptions;
  }): Promise<ApplePayResponse> {
    console.log(options);
    throw 'Apple Pay is not supported on web';
  }

  async cancelApplePay(): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async finalizeApplePayTransaction(
    options: FinalizeApplePayTransactionOptions,
  ): Promise<void> {
    console.log(options);
    throw 'Apple Pay is not supported on web';
  }

  async isGooglePayAvailable(): Promise<void> {
    return new Promise(reject => reject());
  }

  async payWithGooglePay(options: {
    googlePayOptions: GooglePayOptions;
  }): Promise<GooglePayResponse> {
    console.log(options);
    throw 'Google Pay is not supported on web';
  }
}
