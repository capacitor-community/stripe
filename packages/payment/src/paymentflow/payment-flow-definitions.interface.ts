import type { PluginListenerHandle } from '@capacitor/core';

import type { CreatePaymentFlowOption } from '../shared';

import type { PaymentFlowEventsEnum, PaymentFlowResultInterface } from './payment-flow-events.enum';

export interface PaymentFlowDefinitions {
  /**
   * Creates a PaymentFlow instance. Use PaymentFlow when the app must collect
   * payment details first and confirm them in a later step.
   */
  createPaymentFlow(options: CreatePaymentFlowOption): Promise<void>;
  /**
   * Presents the PaymentFlow created by `createPaymentFlow()` and resolves
   * with the last four digits of the selected card.
   */
  presentPaymentFlow(): Promise<{
    cardNumber: string;
  }>;
  /**
   * Confirms the payment details collected by `presentPaymentFlow()`.
   */
  confirmPaymentFlow(): Promise<{
    paymentResult: PaymentFlowResultInterface;
  }>;

  /** Emitted when PaymentFlow has been created and is ready to present. */
  addListener(eventName: PaymentFlowEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when PaymentFlow could not be created. */
  addListener(
    eventName: PaymentFlowEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted when the PaymentFlow UI is presented. */
  addListener(eventName: PaymentFlowEventsEnum.Opened, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted after the collected payment details are confirmed. */
  addListener(eventName: PaymentFlowEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when the customer dismisses PaymentFlow. */
  addListener(eventName: PaymentFlowEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when PaymentFlow collection or confirmation fails. */
  addListener(
    eventName: PaymentFlowEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after payment details are collected and before confirmation. The
   * card number contains only the last four digits.
   */
  addListener(
    eventName: PaymentFlowEventsEnum.Created,
    listenerFunc: (info: { cardNumber: string }) => void,
  ): Promise<PluginListenerHandle>;
}
