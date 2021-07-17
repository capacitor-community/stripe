import { WebPlugin } from '@capacitor/core';
import type { Stripe } from '@stripe/stripe-js';

import { PaymentSheetEventsEnum } from './definitions';
import type {
  StripeInitializationOptions,
  StripePlugin,
  CreatePaymentSheetOption,
  CreateSetupIntentOption,
  PaymentSheetResultInterface,
} from './definitions';

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private paymentSheetSettings: CreatePaymentSheetOption = {
    paymentIntentClientSecret: undefined,
    customerEphemeralKeySecret: undefined,
    customerId: undefined,
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

  async presentPaymentSheet(): Promise<{
    paymentResult: PaymentSheetResultInterface;
  }> {
    const paymentSheetDOM = document.createElement('stripe-checkout') as any;
    paymentSheetDOM.publishableKey = this.publishableKey;
    paymentSheetDOM.paymentIntentClientSecret = this.paymentSheetSettings.paymentIntentClientSecret;
    paymentSheetDOM.customerEphemeralKeySecret = this.paymentSheetSettings.customerEphemeralKeySecret;
    paymentSheetDOM.customerId = this.paymentSheetSettings.customerId;
    document.body.appendChild(paymentSheetDOM);
    return {
      paymentResult: PaymentSheetEventsEnum.Completed,
    };
  }

  async createSetupIntent(options: CreateSetupIntentOption): Promise<void> {
    console.log(options)
    return;
  }

  async presentSetupIntent(): Promise<void> {
    return;
  }
}
