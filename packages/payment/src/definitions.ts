import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';
import type { PaymentFlowDefinitions } from './paymentflow';
import type { PaymentSheetDefinitions } from './paymentsheet';

export * from './applepay/index';
export * from './googlepay/index';
export * from './paymentflow/index';
export * from './paymentsheet/index';
export * from './shared/index';

type StripeDefinitions = PaymentSheetDefinitions & PaymentFlowDefinitions & ApplePayDefinitions & GooglePayDefinitions;

export interface StripePlugin extends StripeDefinitions {
  /**
   * Configures the Stripe SDK. Call this once before using any payment method.
   *
   * @since 3.0.0
   */
  initialize(opts: StripeInitializationOptions): Promise<void>;
  /**
   * Passes an incoming return URL back to the Stripe SDK after redirect-based
   * authentication.
   *
   * iOS only. Call this from your app URL handler when Stripe redirects back
   * to the application.
   *
   * @since 4.0.0
   * @url https://stripe.com/docs/payments/3d-secure#return-url
   */
  handleURLCallback?(opts: StripeURLHandlingOptions): Promise<void>;
}

export interface StripeInitializationOptions {
  /**
   * Stripe publishable key for the account that creates the client-side
   * payment UI. Never pass a secret key to the client application.
   *
   * @since 3.0.0
   */
  publishableKey: string;

  /**
   * Connected account ID used when making client-side calls on behalf of a
   * Stripe Connect account.
   *
   * @since 3.0.0
   * @info https://stripe.com/docs/connect/authentication
   */
  stripeAccount?: string;
}

export interface StripeURLHandlingOptions {
  /**
   * Full callback URL received by the application.
   *
   * @since 4.0.0
   */
  url: string;
}

export interface CapacitorStripeContext {
  stripe: StripePlugin;
  isApplePayAvailable: boolean;
  isGooglePayAvailable: boolean;
}
