import type { PluginListenerHandle } from '@capacitor/core';

import type { CreatePaymentFlowOption } from '../shared';

import type { PaymentFlowEventsEnum, PaymentFlowResultInterface } from './payment-flow-events.enum';

export interface PaymentFlowDefinitions {
  /**
   * Creates a PaymentFlow instance. Use PaymentFlow when the app must collect
   * payment details first and confirm them in a later step.
   *
   * @since 3.0.2
   */
  createPaymentFlow(options: CreatePaymentFlowOption): Promise<void>;
  /**
   * Presents the PaymentFlow created by `createPaymentFlow()` and resolves
   * with the last four digits of the selected card.
   *
   * @since 3.0.2
   */
  presentPaymentFlow(): Promise<{
    cardNumber: string;
  }>;
  /**
   * Confirms the payment details collected by `presentPaymentFlow()`.
   *
   * @since 3.0.2
   */
  confirmPaymentFlow(): Promise<{
    paymentResult: PaymentFlowResultInterface;
  }>;

  /**
   * Emitted when PaymentFlow has been created and is ready to present.
   *
   * @since 3.0.2
   */
  addListener(eventName: PaymentFlowEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when PaymentFlow could not be created.
   *
   * @since 3.0.2
   */
  addListener(
    eventName: PaymentFlowEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when the PaymentFlow UI is presented.
   *
   * @since 3.0.2
   */
  addListener(eventName: PaymentFlowEventsEnum.Opened, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted after the collected payment details are confirmed.
   *
   * @since 3.0.2
   */
  addListener(eventName: PaymentFlowEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the customer dismisses PaymentFlow.
   *
   * @since 3.0.2
   */
  addListener(eventName: PaymentFlowEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when PaymentFlow collection or confirmation fails.
   *
   * @since 3.0.2
   */
  addListener(
    eventName: PaymentFlowEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after payment details are collected and before confirmation. The
   * card number contains only the last four digits.
   *
   * @since 3.0.2
   */
  addListener(
    eventName: PaymentFlowEventsEnum.Created,
    listenerFunc: (info: { cardNumber: string }) => void,
  ): Promise<PluginListenerHandle>;
}
