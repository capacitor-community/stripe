import type {CardTokenRequest} from '../definitions';
import type {StripeAccountIdOpt} from '../shared';

import type { ConfirmPaymentIntentOptions } from './confirm.interface'
import type { ConfirmPaymentIntentResponse } from './payment.inteface'
import type { ConfirmSetupIntentOptions, ConfirmSetupIntentResponse } from './setup.interface'

export * from './confirm.interface';
export * from './setup.interface';
export * from './payment.inteface'

export interface IntentDefinitions {
  confirmPaymentIntent(
    opts: ConfirmPaymentIntentOptions,
  ): Promise<ConfirmPaymentIntentResponse>;

  confirmSetupIntent(
    opts: ConfirmSetupIntentOptions,
  ): Promise<ConfirmSetupIntentResponse>;
}

export interface CommonIntentOptions extends StripeAccountIdOpt {
  clientSecret: string;

  /**
   * If provided, the payment intent will be confirmed using this card as a payment method.
   */
  card?: CardTokenRequest;

  /**
   * If provided, the payment intent will be confirmed using this payment method
   */
  paymentMethodId?: string;

  /**
   * Optional
   * Used for Webview based 3DS authentication
   */
  redirectUrl?: string;
}

