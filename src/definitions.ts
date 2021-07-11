import type { ApplePayDefinitions } from './types/applepay';
import type { GooglePayDefinitions } from './types/googlepay';

export * from './types/applepay';
export * from './types/googlepay';

type StripeDefinitions = ApplePayDefinitions &
  GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;
  stripeAccount?: string;
}
