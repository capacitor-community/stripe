import type { ApplePayDefinitions } from './applepay';
import type { GooglePayDefinitions } from './googlepay';
import type { PaymentFlowDefinitions } from './paymentflow';
import type { PaymentSheetDefinitions } from './paymentsheet';
export * from './applepay/index';
export * from './googlepay/index';
export * from './paymentflow/index';
export * from './paymentsheet/index';
export * from './shared/index';
declare type StripeDefinitions = PaymentSheetDefinitions & PaymentFlowDefinitions & ApplePayDefinitions & GooglePayDefinitions;
export interface StripePlugin extends StripeDefinitions {
    initialize(opts: StripeInitializationOptions): Promise<void>;
}
export interface StripeInitializationOptions {
    publishableKey: string;
    stripeAccount?: string;
}
