import type { PluginListenerHandle } from '@capacitor/core';

import type { CreatePaymentFlowOption } from '../shared';

import type { PaymentFlowEventsEnum, PaymentFlowResultInterface } from './payment-flow-events.enum';

export interface PaymentFlowDefinitions {
  createPaymentFlow(options: CreatePaymentFlowOption): Promise<void>;
  presentPaymentFlow(): Promise<{
    cardNumber: string;
  }>;
  confirmPaymentFlow(): Promise<{
    paymentResult: PaymentFlowResultInterface
  }>;

  addListener(
    eventName: PaymentFlowEventsEnum.Loaded,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.Opened,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.Completed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: PaymentFlowEventsEnum.Created,
    listenerFunc: (info: {
      cardNumber: string;
    }) => void,
  ): Promise<PluginListenerHandle>;
}
