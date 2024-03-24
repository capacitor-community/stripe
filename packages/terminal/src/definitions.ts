import type { PluginListenerHandle } from '@capacitor/core';

import type { TerminalEventsEnum } from './events.enum';

export enum TerminalConnectTypes {
  Simulated = 'simulated',
  Internet = 'internet',
  Bluetooth = 'bluetooth',
  Usb = 'usb',
  TapToPay = 'tap-to-pay',
}

export type ReaderInterface = {
  index: number;
  serialNumber: string;
};

export * from './events.enum';
export interface StripeTerminalPlugin {
  initialize(options: {
    tokenProviderEndpoint?: string;
    isTest: boolean;
  }): Promise<void>;
  discoverReaders(options: {
    type: TerminalConnectTypes;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }>;
  setConnectionToken(options: { token: string }): Promise<void>;
  connectReader(options: { reader: ReaderInterface }): Promise<void>;
  getConnectedReader(): Promise<{ reader: ReaderInterface | null }>;
  disconnectReader(): Promise<void>;
  cancelDiscoverReaders(): Promise<void>;
  collectPaymentMethod(options: { paymentIntent: string }): Promise<void>;
  cancelCollectPaymentMethod(): Promise<void>;
  confirmPaymentIntent(): Promise<void>;
  addListener(
    eventName: TerminalEventsEnum.Loaded,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.RequestedConnectionToken,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.DiscoveredReaders,
    listenerFunc: () => { reader: ReaderInterface },
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.ConnectedReader,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.ConfirmedPaymentIntent,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.CollectedPaymentIntent,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.Canceled,
    listenerFunc: () => void,
  ): PluginListenerHandle;
  addListener(
    eventName: TerminalEventsEnum.Failed,
    listenerFunc: () => void,
  ): PluginListenerHandle;
}
