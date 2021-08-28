import type { PluginListenerHandle } from '@capacitor/core';

import type {CreateApplePayOption} from '../shared';

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
  ): PluginListenerHandle;

  addListener(
    eventName: ApplePayEventsEnum.FailedToLoad,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: ApplePayEventsEnum.FailedToLoad,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: ApplePayEventsEnum.Completed,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: ApplePayEventsEnum.Canceled,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: ApplePayEventsEnum.Failed,
    listenerFunc: () => void,
  ): PluginListenerHandle;
}
