import { WebPlugin } from '@capacitor/core';
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
  GooglePayResultInterface, CreateApplePayOption,
} from './definitions';
import {ApplePayEventsEnum, PaymentFlowEventsEnum, PaymentSheetEventsEnum} from './definitions';
import { isPlatform } from './shared/platform';

interface StripePaymentSheet
  extends Components.StripePaymentSheet,
    HTMLStencilElement,
    HTMLElement {}

interface StripeRequestButton
  extends Components.StripePaymentRequestButton,
    HTMLStencilElement,
    HTMLElement {}

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private paymentSheet: StripePaymentSheet | undefined;

  private flowStripe: Stripe | undefined;
  private flowCardNumberElement: StripeCardNumberElement | undefined;

  private requestButton: StripeRequestButton | undefined;
  private requestButtonOptions: CreateApplePayOption | undefined;

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
    this.paymentSheet.intentClientSecret = options.paymentIntentClientSecret;
    this.paymentSheet.intentType = 'payment';
    if (options.withZipCode !== undefined) {
      this.paymentSheet.zip = options.withZipCode;
    }

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
    this.paymentSheet.applicationName = '@capacitor-community/stripe';

    // eslint-disable-next-line no-prototype-builtins
    if (options.hasOwnProperty('paymentIntentClientSecret')) {
      this.paymentSheet.intentType = 'payment';
      this.paymentSheet.intentClientSecret = options.paymentIntentClientSecret;
    } else {
      this.paymentSheet.intentType = 'setup';
      this.paymentSheet.intentClientSecret = options.setupIntentClientSecret;
    }
    if (options.withZipCode !== undefined) {
      this.paymentSheet.zip = options.withZipCode;
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
    return new Promise(resolve => resolve());
  }

  async createApplePay(createApplePayOption: CreateApplePayOption): Promise<void> {
    if (!this.publishableKey) {
      this.notifyListeners(ApplePayEventsEnum.FailedToLoad, null);
      return;
    }

    this.requestButton = document.createElement('stripe-payment-request-button');
    document.querySelector('body')?.appendChild(this.requestButton);
    await customElements.whenDefined('stripe-payment-request-button');

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.requestButton.applicationName = '@capacitor-community/stripe';
    } catch (e) {
      console.error(e);
    }

    this.requestButtonOptions = createApplePayOption;
    this.notifyListeners(ApplePayEventsEnum.Loaded, null);
  }

  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (this.requestButton === undefined || this.requestButtonOptions === undefined || this.publishableKey === undefined) {
        return resolve({
          paymentResult: ApplePayEventsEnum.Failed
        });
      }
      await this.requestButton.setPaymentRequestOption({
        country: this.requestButtonOptions.countryCode.toUpperCase(),
        currency: this.requestButtonOptions.currency.toLowerCase(),
        total: this.requestButtonOptions.paymentSummaryItems[this.requestButtonOptions.paymentSummaryItems.length - 1],
        displayItems: this.requestButtonOptions.paymentSummaryItems,
      });

      // await this.requestButton.setPaymentRequestShippingAddressEventHandler(async (event, stripe) => {});
      const intentClientSecret = this.requestButtonOptions.paymentIntentClientSecret;
      await this.requestButton.setPaymentMethodEventHandler(async (event, stripe) => {
        const line1: string[] = event?.shippingAddress?.addressLine || [];
        const { error } = await stripe.confirmCardPayment(
          intentClientSecret,
          {
            payment_method: event.paymentMethod.id,
            shipping: {
              name: event?.shippingAddress?.recipient || '',
              phone: event?.shippingAddress?.phone,
              address: {
                line1: line1.length ? line1[0] : '',
                city: event?.shippingAddress?.city,
                postal_code: event?.shippingAddress?.postalCode,
                state: event?.shippingAddress?.region,
                country: event?.shippingAddress?.country,
              },
            },
          },
          { handleActions: false }
        );
        if (error) {
          this.notifyListeners(ApplePayEventsEnum.Failed, null);
          resolve({
            paymentResult: ApplePayEventsEnum.Failed
          });
        }
        resolve({
          paymentResult: ApplePayEventsEnum.Completed
        });
      });
      await this.requestButton.initStripe(this.publishableKey);

      // ここでApplePayのクリックイベント
    });
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
