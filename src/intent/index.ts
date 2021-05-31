import type {CardTokenRequest, StripeAccountIdOpt} from '../definitions';

export * from './confirm.interface';
export * from './setup.interface';
export * from './payment.inteface'

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

