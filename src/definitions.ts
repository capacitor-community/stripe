
import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';
import type { PaymentSheetDefinitions } from './paymentsheet';

export * from './applepay/index';
export * from './googlepay/index';
export * from './paymentsheet/index'

type StripeDefinitions = PaymentSheetDefinitions & ApplePayDefinitions &
  GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
