import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';

export * from './applepay/index';
export * from './googlepay/index';

type StripeDefinitions = ApplePayDefinitions &
  GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
