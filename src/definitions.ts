import type { PaymentSheetDefinitions } from './paymentsheet';
import type { SetupIntentDefinitions } from './setupIntent';

export * from './paymentsheet/index';
export * from './shared/index';

type StripeDefinitions = PaymentSheetDefinitions & SetupIntentDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
