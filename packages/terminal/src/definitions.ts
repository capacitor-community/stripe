import type { PluginListenerHandle } from '@capacitor/core';

import type { TerminalEventsEnum } from './events.enum';

export enum TerminalConnectType {
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
  initialize(options: { tokenProviderEndpoint: string }): Promise<void>;
  discoverReaders(options: {
    type: TerminalConnectType;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }>;
  connectReader(options: { reader: ReaderInterface }): Promise<void>;
  collect(options: { paymentIntent: string }): Promise<void>;
  addListener(
    eventName: TerminalEventsEnum.Loaded,
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
    eventName: TerminalEventsEnum.Completed,
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
