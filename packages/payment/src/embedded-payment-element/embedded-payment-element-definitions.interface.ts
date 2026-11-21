import type { PluginListenerHandle } from '@capacitor/core';

import type {
  EmbeddedPaymentElementEventsEnum,
  EmbeddedPaymentElementResultInterface,
} from './embedded-payment-element-events.enum';

export interface EmbeddedPaymentElementOptions {
  /** Unique selector for a visible, sized HTML container in the main document. */
  selector: string;
  /** Total in the currency's minor unit, matching the server-created PaymentIntent. */
  amount: number;
  /** Three-letter currency code matching the PaymentIntent. */
  currency: string;
  merchantDisplayName: string;
  paymentIntentClientSecret: string;
  /** Registered app URL for redirect-based payments on iOS. */
  returnURL?: string;
}

export interface EmbeddedPaymentElementState {
  /** Whether a payment option is selected. */
  ready: boolean;
  /** Preferred native content height in CSS pixels, when available. */
  height?: number;
}

export interface EmbeddedPaymentElementDefinitions {
  /** Place the native payment method selector in an existing HTML container on iOS or Android. */
  mountEmbeddedPaymentElement(options: EmbeddedPaymentElementOptions): Promise<void>;
  /** Confirm the selected payment method and wait for Stripe's result. */
  confirmEmbeddedPaymentElement(): Promise<{ paymentResult: EmbeddedPaymentElementResultInterface }>;
  /** Remove the embedded selector when leaving checkout. */
  unmountEmbeddedPaymentElement(): Promise<void>;
  /** Observe selection and content size changes. Register before mounting. */
  addListener(
    eventName: EmbeddedPaymentElementEventsEnum.Change,
    listenerFunc: (state: EmbeddedPaymentElementState) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: EmbeddedPaymentElementEventsEnum.Completed | EmbeddedPaymentElementEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: EmbeddedPaymentElementEventsEnum.Failed,
    listenerFunc: (payload: { error: string }) => void,
  ): Promise<PluginListenerHandle>;
}
