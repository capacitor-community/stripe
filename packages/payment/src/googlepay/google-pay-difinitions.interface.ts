import type { PluginListenerHandle } from '@capacitor/core';

import type { CreateGooglePayOption } from '../shared';

import type { GooglePayEventsEnum, GooglePayResultInterface } from './google-pay-events.enum';

export interface GooglePayDefinitions {
  isGooglePayAvailable(): Promise<void>;

  createGooglePay(options: CreateGooglePayOption): Promise<void>;

  presentGooglePay(): Promise<{
    paymentResult: GooglePayResultInterface;
  }>;

  addListener(
    eventName: GooglePayEventsEnum.Loaded,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: GooglePayEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: GooglePayEventsEnum.Completed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: GooglePayEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: GooglePayEventsEnum.Failed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
}
