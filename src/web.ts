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
} from './definitions';

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
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
    if (typeof options.publishableKey !== 'string' || options.publishableKey.trim().length === 0) {
      throw new Error('you must provide a valid key');
    }

    const script: HTMLScriptElement = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    document.body.appendChild(script);
    this.publishableKey = options.publishableKey;

    return new Promise((resolve, reject) => {
      script.addEventListener(
        'error',
        (ev: ErrorEvent) => {
          document.body.removeChild(script);
          reject('Failed to load Stripe JS: ' + ev.message);
        },
        { once: true },
      );

      script.addEventListener(
        'load',
        () => {
          try {
            this.stripe = new (window as any).Stripe(options.publishableKey);
            resolve();
          } catch (err) {
            document.body.removeChild(script);
            reject(err);
          }
        },
        { once: true },
      );
    });
  }

  async createPaymentSheet(): Promise<void> {
    return;
  }

  async presentPaymentSheet(): Promise<void> {
    return;
  }

  isApplePayAvailable(): Promise<void> {
    return new Promise((reject) => reject());
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
    return new Promise((reject) => reject());
  }

  async payWithGooglePay(options: {
    googlePayOptions: GooglePayOptions;
  }): Promise<GooglePayResponse> {
    console.log(options);
    throw 'Google Pay is not supported on web';
  }
}
