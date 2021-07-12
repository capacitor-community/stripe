import type { PluginListenerHandle } from '@capacitor/core';

import type { PaymentSheetEventsEnum } from './payment-sheet-events.enum';

export interface PaymentSheetDefinitions {
  createPaymentSheet(): Promise<void>;
  presentPaymentSheet(): Promise<void>;

  addListener(
    eventName: PaymentSheetEventsEnum.Loaded,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: PaymentSheetEventsEnum.FailedToLoad,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: PaymentSheetEventsEnum.Opened,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: PaymentSheetEventsEnum.Closed,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: PaymentSheetEventsEnum.Result,
    listenerFunc: () => void,
  ): PluginListenerHandle;
}
