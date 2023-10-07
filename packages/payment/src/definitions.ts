import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';
import type { PaymentFlowDefinitions } from './paymentflow';
import type { PaymentSheetDefinitions } from './paymentsheet';

export * from './applepay/index';
export * from './googlepay/index';
export * from './paymentflow/index';
export * from './paymentsheet/index';
export * from './shared/index';

type StripeDefinitions = PaymentSheetDefinitions &
  PaymentFlowDefinitions &
  ApplePayDefinitions &
  GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  initialize(opts: StripeInitializationOptions): Promise<void>;
  /**
   * iOS Only
   * @url https://stripe.com/docs/payments/3d-secure#return-url
   */
  handleURLCallback?(opts: StripeURLHandlingOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  publishableKey: string;

  /**
   * Optional. Making API calls for connected accounts
   * @info https://stripe.com/docs/connect/authentication
   */
  stripeAccount?: string;
}

export interface StripeURLHandlingOptions {
  url: string;
}

export interface CapacitorStripeContext {
  stripe: StripePlugin;
  isApplePayAvailable: boolean;
  isGooglePayAvailable: boolean;
}

/**
 * This is for @capacitor/docgen only.
 * Not use in product.
 */
export interface DocGenType {
  stripe: StripePlugin;
  context: CapacitorStripeContext;
}
