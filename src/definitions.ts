import type { PaymentSheetDefinitions } from './paymentsheet';

export * from './paymentsheet/index';
export * from './shared/index';

type StripeDefinitions = PaymentSheetDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
