import {WebPlugin} from '@capacitor/core';
import type {Components} from '@stripe-elements/stripe-elements';
import type {FormSubmitEvent} from '@stripe-elements/stripe-elements/dist/types/interfaces';
import type {HTMLStencilElement} from '@stripe-elements/stripe-elements/dist/types/stencil-public-runtime';
import type {Stripe, StripeCardNumberElement} from '@stripe/stripe-js';

import type {
  ApplePayResultInterface,
  CreateApplePayOption,
  CreateGooglePayOption,
  CreatePaymentFlowOption,
  CreatePaymentSheetOption,
  GooglePayResultInterface,
  PaymentFlowResultInterface,
  PaymentSheetResultInterface,
  StripeInitializationOptions,
  StripePlugin,
} from './definitions';
import {ApplePayEventsEnum, GooglePayEventsEnum, PaymentFlowEventsEnum, PaymentSheetEventsEnum} from './definitions';
import {isPlatform} from './shared/platform';

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

  private requestApplePay: StripeRequestButton | undefined;
  private requestApplePayOptions: CreateApplePayOption | undefined;

  private requestGooglePay: StripeRequestButton | undefined;
  private requestGooglePayOptions: CreateGooglePayOption | undefined;

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
    this.requestApplePay = await this.createPaymentRequestButton('ios');
    this.requestApplePayOptions = createApplePayOption;
    this.notifyListeners(ApplePayEventsEnum.Loaded, null);
  }

  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }> {
    return this.presentPaymentRequestButton('ios', this.requestApplePay, this.requestApplePayOptions, ApplePayEventsEnum) as Promise<{
      paymentResult: ApplePayResultInterface;
    }>
  }

  isGooglePayAvailable(): Promise<void> {
    return new Promise(resolve => resolve());
  }

  async createGooglePay(createGooglePayOption: CreateGooglePayOption): Promise<void> {
    if (!this.publishableKey) {
      this.notifyListeners(GooglePayEventsEnum.FailedToLoad, null);
      return;
    }
    this.requestGooglePay = await this.createPaymentRequestButton('md');
    this.requestGooglePayOptions = createGooglePayOption;
    this.notifyListeners(GooglePayEventsEnum.Loaded, null);
  }

  presentGooglePay(): Promise<{
    paymentResult: GooglePayResultInterface;
  }> {
    return this.presentPaymentRequestButton('md', this.requestGooglePay, this.requestGooglePayOptions, GooglePayEventsEnum) as Promise<{
      paymentResult: GooglePayResultInterface;
    }>
  }

  private async createPaymentRequestButton(type: 'ios' | 'md'): Promise<StripeRequestButton> {
    const requestButton = document.createElement('stripe-payment-request-button');
    requestButton.setAttribute('mode', type);
    document.querySelector('body')?.appendChild(requestButton);
    await customElements.whenDefined('stripe-payment-request-button');
    requestButton.applicationName = '@capacitor-community/stripe';

    return requestButton;
  }

  private async presentPaymentRequestButton(type: 'ios' | 'md', requestButton: StripeRequestButton | undefined, requestButtonOptions: CreateApplePayOption | CreateGooglePayOption | undefined, EventsEnum: typeof ApplePayEventsEnum | typeof GooglePayEventsEnum): Promise<{
    paymentResult: ApplePayResultInterface | GooglePayResultInterface;
  }> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (requestButton === undefined || requestButtonOptions === undefined || this.publishableKey === undefined) {
        console.log({requestButton, requestButtonOptions, publishableKey: this.publishableKey});
        this.notifyListeners(EventsEnum.Failed, null);
        return resolve({
          paymentResult: EventsEnum.Failed
        });
      }

      console.log(['setPaymentRequestOption', {
        country: requestButtonOptions.countryCode!.toUpperCase(),
        currency: requestButtonOptions.currency!.toLowerCase(),
        total: requestButtonOptions.paymentSummaryItems![requestButtonOptions.paymentSummaryItems!.length - 1],
        disableWallets: type === 'ios' ? ['googlePay', 'browserCard']: ['applePay', 'browserCard'],
        requestPayerName: true,
        requestPayerEmail: true,
      }])
      await requestButton.setPaymentRequestOption({
        country: requestButtonOptions.countryCode!.toUpperCase(),
        currency: requestButtonOptions.currency!.toLowerCase(),
        total: requestButtonOptions.paymentSummaryItems![requestButtonOptions.paymentSummaryItems!.length - 1],
        disableWallets: type === 'ios' ? ['googlePay', 'browserCard']: ['applePay', 'browserCard'],
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // await this.requestButton.setPaymentRequestShippingAddressEventHandler(async (event, stripe) => {});
      const intentClientSecret = requestButtonOptions.paymentIntentClientSecret;
      await requestButton.setPaymentMethodEventHandler(async (event, stripe) => {
        console.log(['setPaymentMethodEventHandler', event]);
        const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
          intentClientSecret,
          {
            payment_method: event.paymentMethod.id,
          },
          { handleActions: false }
        );
        if (confirmError) {
          console.log(confirmError);
          this.notifyListeners(EventsEnum.Failed, null);
          return resolve({
            paymentResult: EventsEnum.Failed
          });
        }
        if (paymentIntent?.status === "requires_action") {
          const {error} = await stripe.confirmCardPayment(intentClientSecret);
          if (error) {
            this.notifyListeners(EventsEnum.Failed, null);
            return resolve({
              paymentResult: EventsEnum.Failed
            });
          }
        }
        console.log(['paymentIntent', paymentIntent])
        this.notifyListeners(EventsEnum.Completed, null);
        return resolve({
          paymentResult: EventsEnum.Completed
        });
      });
      await requestButton.initStripe(this.publishableKey, false);
    });
  }
}
