import type { PluginListenerHandle } from '@capacitor/core';

import type {CreateApplePayOption, DidSelectShippingContact} from '../shared';

import type { ApplePayEventsEnum, ApplePayResultInterface } from './apple-pay-events.enum';

export interface ApplePayDefinitions {
  isApplePayAvailable(): Promise<void>;

  createApplePay(options: CreateApplePayOption): Promise<void>;

  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }>;

  addListener(
    eventName: ApplePayEventsEnum.Loaded,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.Completed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.DidSelectShippingContact,
    listenerFunc: (data: DidSelectShippingContact) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: ApplePayEventsEnum.DidCreatePaymentMethod,
    listenerFunc: (data: DidSelectShippingContact) => void,
  ): Promise<PluginListenerHandle>;
}
