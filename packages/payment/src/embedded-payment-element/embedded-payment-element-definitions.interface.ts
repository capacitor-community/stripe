import type { PluginListenerHandle } from '@capacitor/core';

import type {
  EmbeddedPaymentElementEventsEnum,
  EmbeddedPaymentElementResultInterface,
} from './embedded-payment-element-events.enum';

export interface EmbeddedPaymentElementOptions {
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
  /** Whether confirm() can start with the selected payment option. */
  ready: boolean;
  /** Preferred native content height in CSS pixels, when available. */
  height?: number;
}

export interface MountedEmbeddedPaymentElement {
  confirm(): Promise<{ paymentResult: EmbeddedPaymentElementResultInterface }>;
  destroy(): Promise<void>;
}

export interface EmbeddedPaymentElementDefinitions {
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
