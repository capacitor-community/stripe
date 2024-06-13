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
  /**
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.models/-simulator-configuration/index.html)
   */
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
   * For Bluetooth, Handoff, and USB readers, this is emitted with a `reason` property when the reader disconnects.
   * 
   * **Note:** For Bluetooth, Handoff, and USB readers, when you call [`disconnectReader()`](#disconnectreader), this event
   * will be emitted twice: one without a `reason` in acknowledgement of your call, and again with a `reason` when the reader
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

  /**
   * Emitted when [`cancelCollectPaymentMethod()`](#cancelcollectpaymentmethod) is called and succeeds.
   * The Promise returned by `cancelCollectPaymentMethod()` will also be resolved.
   */
  addListener(
    eventName: TerminalEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when either [`collectPaymentMethod()`](#collectpaymentmethod) or [`confirmPaymentIntent()`](#confirmpaymentintent)
   * fails. The Promise returned by the relevant call will also be rejected.
   */
  addListener(
    eventName: TerminalEventsEnum.Failed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * Emitted when the connected reader begins installing a software update.
   * If a mandatory software update is available when a reader first connects, that update is
   * automatically installed. The update will be installed before ConnectedReader is emitted and
   * before the Promise returned by [`connectReader()`](#connectreader) resolves.
   * In this case, you will receive this sequence of events:
   * 
   * 1. StartInstallingUpdate
   * 2. ReaderSoftwareUpdateProgress (repeatedly)
   * 3. FinishInstallingUpdates
   * 4. ConnectedReader
   * 5. `connectReader()` Promise resolves
   * 
   * Your app should show UI to the user indiciating that a software update is being installed
   * to explain why connecting is taking longer than usual.
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-start-installing-update.html)
   */
  addListener(
    eventName: TerminalEventsEnum.StartInstallingUpdate,
    listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * Emitted periodically while reader software is updating to inform of the installation progress.
   * `progress` is a float between 0 and 1.
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-report-reader-software-update-progress.html)
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderSoftwareUpdateProgress,
    listenerFunc: ({ progress }: { progress: number }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-finish-installing-update.html)
   */
  addListener(
    eventName: TerminalEventsEnum.FinishInstallingUpdate,
    listenerFunc: ({ update, errorCode, errorMessage }: {
      update: ReaderSoftwareUpdateInterface|null,
      errorCode: string|null,
      errorMessage: string|null,
    }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * Emitted upon connection and every 10 minutes.
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-battery-level-update.html)
   */
  addListener(
    eventName: TerminalEventsEnum.BatteryLevel,
    listenerFunc: ({ level, charging, status }: {
      level: number,
      charging: boolean,
      status: BatteryStatus
    }) => void,
  ): Promise<PluginListenerHandle>,

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listenable/on-report-reader-event.html)
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderEvent,
    listenerFunc: ({ event }: { event: ReaderEvent }) => void,
  ): Promise<PluginListenerHandle>,

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * Emitted when the Terminal requests that a message be displayed in your app.
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-request-reader-display-message.html)
   */
  addListener(
    eventName: TerminalEventsEnum.RequestDisplayMessage,
    listenerFunc: ({ messageType, message }: { messageType: ReaderDisplayMessage, message: string }) => void,
  ): Promise<PluginListenerHandle>,

  /**
   * **Only applicable to Bluetooth and USB readers.**
   * 
   * Emitted when the reader begins waiting for input. Your app should prompt the customer
   * to present a source using one of the given input options. If the reader emits a message,
   * the RequestDisplayMessage event will be emitted.
   * 
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-request-reader-input.html)
   */
  addListener(
    eventName: TerminalEventsEnum.RequestReaderInput,
    listenerFunc: ({ options, message }: { options: ReaderInputOption[], message: string }) => void,
  ): Promise<PluginListenerHandle>,

  /**
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-payment-status-change.html)
   */
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
