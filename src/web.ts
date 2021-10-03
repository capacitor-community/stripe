import { WebPlugin } from '@capacitor/core';
import { isPlatform } from './shared/platform';
import type { Components } from '@stripe-elements/stripe-elements';
import type { FormSubmitEvent } from '@stripe-elements/stripe-elements/dist/types/interfaces';
import type { HTMLStencilElement } from '@stripe-elements/stripe-elements/dist/types/stencil-public-runtime';
import type { Stripe, StripeCardNumberElement } from '@stripe/stripe-js';

import type {
  StripeInitializationOptions,
  StripePlugin,
  CreatePaymentSheetOption,
  PaymentSheetResultInterface,
  CreatePaymentFlowOption,
  PaymentFlowResultInterface,
  ApplePayResultInterface,
  GooglePayResultInterface,
} from './definitions';
import { PaymentFlowEventsEnum, PaymentSheetEventsEnum } from './definitions';

interface StripePaymentSheet
  extends Components.StripePaymentSheet,
    HTMLStencilElement,
    HTMLElement {}

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private paymentSheet: StripePaymentSheet | undefined;

  private flowStripe: Stripe | undefined;
  private flowCardNumberElement: StripeCardNumberElement | undefined;

  constructor() {
    super({
      name: 'Stripe',
      platforms: ['web'],
    });
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
    if (!this.publishableKey) {
      this.notifyListeners(PaymentSheetEventsEnum.FailedToLoad, null);
      return;
    }

    this.paymentSheet = document.createElement('stripe-payment-sheet');
    document.querySelector('body')?.appendChild(this.paymentSheet);
    await customElements.whenDefined('stripe-payment-sheet');

    this.paymentSheet.publishableKey = this.publishableKey;
    this.paymentSheet.intentClientSecret =
      options.paymentIntentClientSecret;
    this.paymentSheet.intentType = "payment";

    this.notifyListeners(PaymentSheetEventsEnum.Loaded, null);
  }

  async presentPaymentSheet(): Promise<{
    paymentResult: PaymentSheetResultInterface;
  }> {
    if (!this.paymentSheet) {
      throw new Error();
    }

    const props = await this.paymentSheet.present();
    if (props === undefined) {
      this.notifyListeners(PaymentSheetEventsEnum.Canceled, null);
      return {
        paymentResult: PaymentSheetEventsEnum.Canceled,
      };
    }

    const {
      detail: { stripe, cardNumberElement },
    } = props as {
      detail: FormSubmitEvent;
    };

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
    });
    this.paymentSheet.updateProgress('success');
    this.paymentSheet.remove();

    if (result.error !== undefined) {
      this.notifyListeners(PaymentSheetEventsEnum.Failed, null);
      return {
        paymentResult: PaymentSheetEventsEnum.Failed,
      };
    }

    this.notifyListeners(PaymentSheetEventsEnum.Completed, null);

    return {
      paymentResult: PaymentSheetEventsEnum.Completed,
    };
  }

  async createPaymentFlow(options: CreatePaymentFlowOption): Promise<void> {
    if (!this.publishableKey) {
      this.notifyListeners(PaymentFlowEventsEnum.FailedToLoad, null);
      return;
    }

    this.paymentSheet = document.createElement('stripe-payment-sheet');
    document.querySelector('body')?.appendChild(this.paymentSheet);
    await customElements.whenDefined('stripe-payment-sheet');

    this.paymentSheet.publishableKey = this.publishableKey;

    // eslint-disable-next-line no-prototype-builtins
    if (options.hasOwnProperty('paymentIntentClientSecret')) {
      this.paymentSheet.intentType = "payment";
      this.paymentSheet.intentClientSecret =
        options.paymentIntentClientSecret;
    } else {
      this.paymentSheet.intentType = "setup";
      this.paymentSheet.intentClientSecret =
        options.setupIntentClientSecret;
    }

    if (isPlatform(window, 'ios')) {
      this.paymentSheet.buttonLabel = 'Add card';
      this.paymentSheet.sheetTitle = 'Add a card';
    } else {
      this.paymentSheet.buttonLabel = 'Add';
    }

    this.notifyListeners(PaymentFlowEventsEnum.Loaded, null);
  }

  async presentPaymentFlow(): Promise<{
    cardNumber: string;
  }> {
    if (!this.paymentSheet) {
      throw new Error();
    }

    this.notifyListeners(PaymentFlowEventsEnum.Opened, null);
    const props = await this.paymentSheet.present().catch(() => undefined);
    if (props === undefined) {
      this.notifyListeners(PaymentFlowEventsEnum.Canceled, null);
      throw new Error();
    }

    const {
      detail: { stripe, cardNumberElement },
    } = props as {
      detail: FormSubmitEvent;
    };

    const { token } = await stripe.createToken(cardNumberElement);
    if (token === undefined || token.card === undefined) {
      throw new Error();
    }

    this.flowStripe = stripe;
    this.flowCardNumberElement = cardNumberElement;

    this.notifyListeners(PaymentFlowEventsEnum.Created, {
      cardNumber: token.card.last4,
    });
    return {
      cardNumber: token.card.last4,
    };
  }

  async confirmPaymentFlow(): Promise<{
    paymentResult: PaymentFlowResultInterface;
  }> {
    if (!this.paymentSheet || !this.flowStripe || !this.flowCardNumberElement) {
      throw new Error();
    }

    const result = await this.flowStripe.createPaymentMethod({
      type: 'card',
      card: this.flowCardNumberElement,
    });

    if (result.error !== undefined) {
      this.notifyListeners(PaymentFlowEventsEnum.Failed, null);
    }

    this.paymentSheet.updateProgress('success');
    this.paymentSheet.remove();

    this.notifyListeners(PaymentFlowEventsEnum.Completed, null);
    return {
      paymentResult: PaymentFlowEventsEnum.Completed,
    };
  }

  isApplePayAvailable(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  createApplePay(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }> {
    throw this.unimplemented('Not implemented on web.');
  }

  isGooglePayAvailable(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  createGooglePay(): Promise<void> {
    throw this.unimplemented('Not implemented on web.');
  }

  presentGooglePay(): Promise<{
    paymentResult: GooglePayResultInterface;
  }> {
    throw this.unimplemented('Not implemented on web.');
  }
}
