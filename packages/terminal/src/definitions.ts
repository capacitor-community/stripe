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
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.RequestedConnectionToken,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.DiscoveredReaders,
    listenerFunc: () => { reader: ReaderInterface },
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.ConnectedReader,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.ConfirmedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.CollectedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.Failed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * @deprecated
   * This method has been deprecated and replaced by the `collectPaymentMethod`.
   * Similarly, note that TerminalEvents.Completed is now obsolete.
   * And, method `confirmPaymentIntent` added to be executed after `collectPaymentMethod` is executed.
   *
   * This is left as type string to avoid accidental use.
   */
  collect: string;

  /**
   * @deprecated
   * This method has been deprecated and replaced by the `cancelCollectPaymentMethod`.
   *
   * This is left as type string to avoid accidental use.
   */
  cancelCollect: string;
}
