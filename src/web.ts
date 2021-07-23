import { WebPlugin } from '@capacitor/core';
import type { Components } from '@stripe-elements/stripe-elements';
import type { FormSubmitEvent } from '@stripe-elements/stripe-elements/dist/types/interfaces';
import type { HTMLStencilElement } from '@stripe-elements/stripe-elements/dist/types/stencil-public-runtime';

import type {
  StripeInitializationOptions,
  StripePlugin,
  CreatePaymentSheetOption,
  PaymentSheetResultInterface,
} from './definitions';
import { PaymentSheetEventsEnum } from './definitions';

interface StripePaymentSheet
  extends Components.StripePaymentSheet,
    HTMLStencilElement,
    HTMLElement {}
interface StripeElementModal
  extends Components.StripeElementModal,
    HTMLStencilElement,
    HTMLElement {}

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private stripeElement: StripePaymentSheet | undefined;

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
      window.addEventListener(PaymentSheetEventsEnum.FailedToLoad, () => null);
      return;
    }

    const stripeModalElement = document.createElement('stripe-element-modal');
    stripeModalElement.appendChild(
      document.createElement('stripe-payment-sheet'),
    );
    document.querySelector('body')?.appendChild(stripeModalElement);

    await customElements.whenDefined('stripe-payment-sheet');

    this.stripeElement = document.getElementsByTagName(
      'stripe-payment-sheet',
    )[0];
    await this.stripeElement.initStripe(this.publishableKey);
    this.stripeElement.paymentIntentClientSecret =
      options.paymentIntentClientSecret;

    window.addEventListener(PaymentSheetEventsEnum.Loaded, () => null);
  }

  async presentPaymentSheet(): Promise<{
    paymentResult: PaymentSheetResultInterface;
  }> {
    if (!this.stripeElement) {
      throw new Error();
    }

    await customElements.whenDefined('stripe-element-modal');
    const stripeModalElement: StripeElementModal = document.getElementsByTagName(
      'stripe-element-modal',
    )[0];
    await stripeModalElement.openModal();

    /**
     * When close stripeModalElement, remove stripe-elements DOM.
     */
    stripeModalElement.addEventListener('close', () => {
      StripeWeb.removeStripeDOM(this.stripeElement, stripeModalElement);
    });

    const props = await new Promise((resolve, reject) => {
      if (!this.stripeElement || !stripeModalElement) {
        return reject();
      }
      this.stripeElement.addEventListener('formSubmit', async props => {
        resolve(props);
      });
      stripeModalElement.addEventListener('close', () => reject());
    }).catch(() => undefined);

    if (props === undefined) {
      window.addEventListener(PaymentSheetEventsEnum.Canceled, () => null);
      return {
        paymentResult: PaymentSheetEventsEnum.Canceled,
      };
    }

    const {
      detail: { stripe, cardNumber },
    } = (props as unknown) as {
      detail: FormSubmitEvent;
    };

    const result = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumber,
    });
    this.stripeElement.updateProgress('success');
    await stripeModalElement.closeModal();
    StripeWeb.removeStripeDOM(this.stripeElement, stripeModalElement);

    if (result.error !== undefined) {
      window.addEventListener(PaymentSheetEventsEnum.Failed, () => null);
      return {
        paymentResult: PaymentSheetEventsEnum.Failed,
      };
    }

    window.addEventListener(PaymentSheetEventsEnum.Completed, () => null);
    return {
      paymentResult: PaymentSheetEventsEnum.Completed,
    };
  }

  private static removeStripeDOM(stripeElement: StripePaymentSheet | undefined, stripeModalElement: StripeElementModal | undefined): void {
    if (stripeElement) {
      stripeElement.remove();
      stripeElement = undefined;
    }
    if (stripeModalElement) {
      stripeModalElement.remove();
      stripeModalElement = undefined;
    }
    console.log([stripeElement, stripeModalElement])
  }
}
