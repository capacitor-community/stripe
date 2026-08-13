import type { PluginListenerHandle } from '@capacitor/core';

import type { CreatePaymentSheetOption } from '../shared';

import type { PaymentSheetEventsEnum, PaymentSheetResultInterface } from './payment-sheet-events.enum';

export interface PaymentSheetDefinitions {
  /**
   * Creates and configures a PaymentSheet instance. Wait for this Promise or
   * the `Loaded` event before calling `presentPaymentSheet()`.
   *
   * @since 3.0.0
   */
  createPaymentSheet(options: CreatePaymentSheetOption): Promise<void>;
  /**
   * Presents the PaymentSheet created by `createPaymentSheet()` and resolves
   * with its completed, canceled, or failed result.
   *
   * @since 3.0.0
   */
  presentPaymentSheet(): Promise<{
    paymentResult: PaymentSheetResultInterface;
  }>;

  /**
   * Emitted when PaymentSheet has been created and is ready to present.
   *
   * @since 3.0.0
   */
  addListener(eventName: PaymentSheetEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when PaymentSheet could not be created.
   *
   * @since 3.0.0
   */
  addListener(
    eventName: PaymentSheetEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after the customer completes PaymentSheet.
   *
   * @since 3.0.0
   */
  addListener(eventName: PaymentSheetEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the customer dismisses PaymentSheet.
   *
   * @since 3.0.0
   */
  addListener(eventName: PaymentSheetEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when PaymentSheet finishes with an error.
   *
   * @since 3.0.0
   */
  addListener(
    eventName: PaymentSheetEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;
}
