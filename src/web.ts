import { WebPlugin } from '@capacitor/core';
import type { Stripe } from '@stripe/stripe-js';

import type {
  StripeInitializationOptions,
  StripePlugin,
  CreatePaymentSheetOption,
} from './definitions';
import { PaymentSheetEventsEnum } from './definitions';

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
    paymentResult: PaymentSheetEventsEnum;
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
}
