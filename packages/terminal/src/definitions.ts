import type { PluginListenerHandle } from '@capacitor/core';

import type { TerminalEventsEnum } from './events.enum';
import type {
  TerminalConnectTypes,
  UpdateTimeEstimate,
  SimulateReaderUpdate,
  SimulatedCardType,
  BatteryStatus,
  ReaderEvent,
  ReaderDisplayMessage,
  ReaderInputOption,
  PaymentStatus,
  DisconnectReason,
} from './stripe.enum';

export type ReaderInterface = {
  index: number;
  serialNumber: string;
};

export type ReaderSoftwareUpdateInterface = {
  version: string;
  settingsVersion: string;
  requiredAt: number;
  timeEstimate: UpdateTimeEstimate;
};

export * from './events.enum';
export * from './stripe.enum';
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
  setSimulatorConfiguration(options: {
    update?: SimulateReaderUpdate,
    simulatedCard?: SimulatedCardType,
    simulatedTipAmount?: number,
  }): Promise<void>;
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
    listenerFunc: ({ readers }: { readers: ReaderInterface[] }) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.ConnectedReader,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;
  /**
   * Emitted when the reader is disconnected, either in response to [`disconnectReader()`](#disconnectreader)
   * or some connection error.
   * 
   * For all reader types, this is emitted in response to [`disconnectReader()`](#disconnectreader)
   * without a `reason` property.
   * 
   * For Bluetooth and USB readers, this is emitted with a `reason` property when the reader disconnects.
   * 
   * **Note:** For Bluetooth and USB readers, when you call [`disconnectReader()`](#disconnectreader), this event will
   * be emitted twice: one without a `reason` in acknowledgement of your call, and again with a `reason` when the reader
   * finishes disconnecting.
   */
  addListener(
    eventName: TerminalEventsEnum.DisconnectedReader,
    listenerFunc: ({ reason }: { reason?: DisconnectReason }) => void,
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
  addListener(
    eventName: TerminalEventsEnum.StartInstallingUpdate,
    listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface }) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.ReaderSoftwareUpdateProgress,
    listenerFunc: ({ progress }: { progress: number }) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.FinishInstallingUpdate,
    listenerFunc: ({ update, errorCode, errorMessage }: {
      update: ReaderSoftwareUpdateInterface|null,
      errorCode: string|null,
      errorMessage: string|null,
    }) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: TerminalEventsEnum.BatteryLevel,
    listenerFunc: ({ level, charging, status }: {
      level: number,
      charging: boolean,
      status: BatteryStatus
    }) => void,
  ): Promise<PluginListenerHandle>,
  addListener(
    eventName: TerminalEventsEnum.ReaderEvent,
    listenerFunc: ({ event }: { event: ReaderEvent }) => void,
  ): Promise<PluginListenerHandle>,
  addListener(
    eventName: TerminalEventsEnum.RequestDisplayMessage,
    listenerFunc: ({ messageType, message }: { messageType: ReaderDisplayMessage, message: string }) => void,
  ): Promise<PluginListenerHandle>,
  addListener(
    eventName: TerminalEventsEnum.RequestReaderInput,
    listenerFunc: ({ options, message }: { options: ReaderInputOption[], message: string }) => void,
  ): Promise<PluginListenerHandle>,
  addListener(
    eventName: TerminalEventsEnum.PaymentStatusChange,
    listenerFunc: ({ status }: { status: PaymentStatus }) => void,
  ): Promise<PluginListenerHandle>,

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
