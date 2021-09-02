import type { ApplePayDefinitions } from './applepay';
import type { PaymentFlowDefinitions } from './paymentflow';
import type { PaymentSheetDefinitions } from './paymentsheet';

export * from './applepay/index';
export * from './paymentflow/index';
export * from './paymentsheet/index';
export * from './shared/index';

type StripeDefinitions = PaymentSheetDefinitions &
  PaymentFlowDefinitions &
  ApplePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
