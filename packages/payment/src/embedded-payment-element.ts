import type { PluginListenerHandle } from '@capacitor/core';

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
  confirmEmbeddedPaymentElement(): Promise<{ result: 'completed' | 'canceled' | 'failed' }>;
  /** Remove the embedded selector when leaving checkout. */
  destroyEmbeddedPaymentElement(): Promise<void>;
  /** Observe selection and content size changes. Register before mounting. */
  addListener(
    eventName: 'embeddedPaymentElementChange',
    listenerFunc: (state: EmbeddedPaymentElementState) => void,
  ): Promise<PluginListenerHandle>;
}
