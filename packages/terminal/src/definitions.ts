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
  ConnectionStatus,
  NetworkStatus,
  LocationStatus,
  DeviceType,
} from './stripe.enum';

/** Snapshot of a Stripe Terminal reader returned by discovery or connection. */
export type ReaderInterface = {
  /**
   * Stable hardware serial number used as the reader's primary identifier.
   */
  serialNumber: string;

  label: string;
  batteryLevel: number;
  batteryStatus: BatteryStatus;
  simulated: boolean;
  id: number;
  availableUpdate: ReaderSoftwareUpdateInterface | undefined;
  locationId: string;
  ipAddress: string;
  status: NetworkStatus;
  location: LocationInterface | undefined;
  locationStatus: LocationStatus;
  deviceType: DeviceType;
  deviceSoftwareVersion: string | null;

  /**
   * iOS Only properties. These properties are not available on Android.
   */
  isCharging: number;

  /**
   * Android Only properties. These properties are not available on iOS.
   */
  baseUrl: string;
  bootloaderVersion: string;
  configVersion: string;
  emvKeyProfileId: string;
  firmwareVersion: string;
  hardwareVersion: string;
  macKeyProfileId: string;
  pinKeyProfileId: string;
  trackKeyProfileId: string;
  settingsVersion: string;
  pinKeysetId: string;
};
/** Stripe Terminal Location assigned to a reader. */
export type LocationInterface = {
  id: string;
  displayName: string;
  address: {
    city: string;
    country: string;
    postalCode: string;
    line1: string;
    line2: string;
    state: string;
  };
  ipAddress: string;
};

/** Metadata for an available reader software update. */
export type ReaderSoftwareUpdateInterface = {
  deviceSoftwareVersion: string;
  estimatedUpdateTime: UpdateTimeEstimate;
  requiredAt: number;
};

/** Line item displayed on a reader's customer-facing screen. */
export type CartLineItem = {
  displayName: string;
  quantity: number;
  amount: number;
};

/** Cart totals displayed on a reader's customer-facing screen. */
export type Cart = {
  currency: string;
  tax: number;
  total: number;
  lineItems: CartLineItem[];
};

/**
 * Color value for TapToPayUxConfiguration.
 * Use 'default' to use Stripe's default color, or a hex string like '#965D35'.
 */
export type TapToPayColor = 'default' | string;

/**
 * Dark mode setting for Tap to Pay UX.
 */
export enum TapToPayDarkMode {
  System = 'SYSTEM',
  Dark = 'DARK',
  Light = 'LIGHT',
}

/**
 * Color scheme for the Tap to Pay screen.
 */
export interface TapToPayColorScheme {
  /** Primary color (tap zone indicator). Hex string or 'default'. */
  primary?: TapToPayColor;
  /** Success state color. Hex string or 'default'. */
  success?: TapToPayColor;
  /** Error state color. Hex string or 'default'. */
  error?: TapToPayColor;
}

/**
 * Tap zone position configuration.
 * Controls where the tap indicator appears on screen.
 */
export type TapToPayTapZone =
  | { type: 'default' }
  | { type: 'front'; xBias: number; yBias: number }
  | { type: 'behind'; xBias: number; yBias: number }
  | { type: 'above'; bias?: number }
  | { type: 'below'; bias?: number }
  | { type: 'left'; bias?: number }
  | { type: 'right'; bias?: number };

/**
 * Configuration for the Tap to Pay UX (Android only).
 */
export interface TapToPayUxConfiguration {
  /** Color scheme for the Tap to Pay screen */
  colors?: TapToPayColorScheme;
  /** Dark mode setting */
  darkMode?: TapToPayDarkMode;
  /** Tap zone position configuration */
  tapZone?: TapToPayTapZone;
}

/**
 * Options for isTapToPayAccountLinked.
 */
export interface IsTapToPayAccountLinkedOptions {
  /**
   * Connected account ID, for Stripe Connect platforms.
   * Omit to check the account that owns the API key.
   */
  onBehalfOf?: string;
}

export interface DiscoverReadersOptions {
  /** Discovery method and reader transport to use. */
  type: TerminalConnectTypes;
  /**
   * Stripe Terminal Location ID used to scope internet reader discovery and
   * reader registration where required.
   */
  locationId?: string;

  /**
   * Only applies to Bluetooth scan discovery (iOS only).
   * During discovery, readers are reported via DiscoveryDelegate.didUpdateDiscoveredReaders.
   * This timeout controls how long to wait before resolving the `discoverReaders` method with the current list.
   *
   * If this setting is not specified or is set to 0, the initial scan results will be returned.
   */
  bluetoothScanWaitTime?: number;
}

export interface StripeTerminalInitializationOptions {
  /** HTTPS endpoint that creates a new Stripe Terminal connection token. */
  tokenProviderEndpoint?: string;
  /** Enables simulated discovery and readers where supported. */
  isTest: boolean;
}

export interface SetConnectionTokenOptions {
  /** Secret returned by the Stripe Connection Token API. */
  token: string;
}

export interface SimulatorConfigurationOptions {
  /** Simulated reader-update scenario. */
  update?: SimulateReaderUpdate;
  /** Simulated card presented during collection. */
  simulatedCard?: SimulatedCardType;
  /** Simulated tip amount in the PaymentIntent currency's smallest unit. */
  simulatedTipAmount?: number;
}

export interface ConnectReaderOptions {
  /** Reader selected from the latest discovery result. */
  reader: ReaderInterface;
  /**
   * Automatically attempts to reconnect after an unexpected disconnect.
   * @default false
   */
  autoReconnectOnUnexpectedDisconnect?: boolean;

  /**
   * Merchant name displayed by local mobile readers. iOS only; on Android
   * configure the merchant name on the PaymentIntent.
   */
  merchantDisplayName?: string;

  /**
   * Stripe connected-account ID for which the funds are intended. iOS local
   * mobile readers only; on Android configure it on the PaymentIntent.
   */
  onBehalfOf?: string;
}

export interface CollectPaymentMethodOptions {
  /** Client secret of a PaymentIntent configured for `card_present`. */
  paymentIntent: string;
}

export * from './events.enum';
export * from './stripe.enum';
export interface StripeTerminalPlugin {
  /**
   * Initializes the Stripe Terminal SDK and its connection-token provider.
   * Call this once before discovering readers.
   *
   * When `tokenProviderEndpoint` is provided, the plugin sends a POST request
   * and expects `{ secret: string }`. When it is omitted, handle
   * `RequestedConnectionToken` and call `setConnectionToken()` instead.
   */
  initialize(options: StripeTerminalInitializationOptions): Promise<void>;
  /**
   * Discovers readers using the requested transport. The returned readers are
   * snapshots; listen for `DiscoveredReaders` when continuous discovery can
   * produce additional results.
   */
  discoverReaders(options: DiscoverReadersOptions): Promise<{
    readers: ReaderInterface[];
  }>;
  /**
   * Supplies a connection-token secret after `RequestedConnectionToken` is
   * emitted. Create each token on your server and use it only once.
   */
  setConnectionToken(options: SetConnectionTokenOptions): Promise<void>;
  /**
   * Configures the simulated reader used in test mode. Call before the
   * operation whose behavior you want to simulate.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.models/-simulator-configuration/index.html)
   */
  setSimulatorConfiguration(options: SimulatorConfigurationOptions): Promise<void>;

  /**
   * Connects to a reader returned by `discoverReaders()`.
   */
  connectReader(options: ConnectReaderOptions): Promise<void>;
  /** Returns the currently connected reader, or `null` when disconnected. */
  getConnectedReader(): Promise<{ reader: ReaderInterface | null }>;
  /** Disconnects the active reader. Resolves immediately if none is connected. */
  disconnectReader(): Promise<void>;
  /** Cancels the active reader-discovery operation. */
  cancelDiscoverReaders(): Promise<void>;
  /**
   * Collects a payment method for a server-created PaymentIntent. Confirm the
   * collected intent with `confirmPaymentIntent()`.
   */
  collectPaymentMethod(options: CollectPaymentMethodOptions): Promise<void>;
  /** Cancels an in-progress `collectPaymentMethod()` call. */
  cancelCollectPaymentMethod(): Promise<void>;
  /** Confirms the PaymentIntent most recently collected by the reader. */
  confirmPaymentIntent(): Promise<void>;
  /** Installs the software update reported by `ReportAvailableUpdate`. */
  installAvailableUpdate(): Promise<void>;
  /** Cancels an in-progress optional reader software update. */
  cancelInstallUpdate(): Promise<void>;
  /** Displays cart details on a reader with a customer-facing display. */
  setReaderDisplay(options: Cart): Promise<void>;
  /** Clears cart details from the reader's customer-facing display. */
  clearReaderDisplay(): Promise<void>;
  /** Reboots the connected reader. Supported reader types are platform dependent. */
  rebootReader(): Promise<void>;
  /** Cancels an automatic reader reconnection attempt. */
  cancelReaderReconnection(): Promise<void>;

  /**
   * Configure the Tap to Pay UX appearance (Android only).
   * Call this after initialize() but before connectReader().
   * Has no effect on iOS or web platforms.
   */
  setTapToPayUxConfiguration(options: TapToPayUxConfiguration): Promise<void>;

  /**
   * Check whether the merchant has accepted Apple's Tap to Pay on iPhone
   * Terms and Conditions.
   *
   * iOS only, and requires iOS 16.4 or later. `initialize()` must have been
   * called first because the SDK needs a connection token provider, but no
   * reader connection is required and the call does not activate the device.
   *
   * The answer is read from Apple on every call. Apple's Tap to Pay on iPhone
   * requirements state that acceptance state must be retrieved from Apple
   * rather than from a local variable, so do not cache the result.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-ios/docs/Classes/SCPTerminal.html#/c:objc(cs)SCPTerminal(im)isTapToPayAccountLinked:completion:)
   */
  isTapToPayAccountLinked(options?: IsTapToPayAccountLinkedOptions): Promise<{ isLinked: boolean }>;

  /** Emitted after the Terminal SDK has initialized. */
  addListener(eventName: TerminalEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the SDK needs a connection token and no token endpoint was
   * configured. Respond by calling `setConnectionToken()`.
   */
  addListener(
    eventName: TerminalEventsEnum.RequestedConnectionToken,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted whenever discovery produces an updated reader list. During iOS
   * Bluetooth discovery this event can be emitted multiple times.
   *
   * https://docs.stripe.com/terminal/payments/connect-reader?terminal-sdk-platform=ios&reader-type=bluetooth
   */
  addListener(
    eventName: TerminalEventsEnum.DiscoveredReaders,
    listenerFunc: ({ readers }: { readers: ReaderInterface[] }) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted after a reader connects successfully. */
  addListener(eventName: TerminalEventsEnum.ConnectedReader, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the reader is disconnected, either in response to [`disconnectReader()`](#disconnectreader)
   * or some connection error.
   *
   * For all reader types, this is emitted in response to [`disconnectReader()`](#disconnectreader)
   * without a `reason` property.
   *
   * For Bluetooth and USB readers, this is emitted with a `reason` property when the reader disconnects.
   *
   * **Note:** For Bluetooth and USB readers, when you call [`disconnectReader()`](#disconnectreader), this event
   * will be emitted twice: one without a `reason` in acknowledgement of your call, and again with a `reason` when the reader
   * finishes disconnecting.
   */
  addListener(
    eventName: TerminalEventsEnum.DisconnectedReader,
    listenerFunc: ({ reason }: { reason?: DisconnectReason }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when the Terminal's connection status changed.
   *
   * Note: You should *not* use this method to detect when a reader unexpectedly disconnects from your app,
   * as it cannot be used to accurately distinguish between expected and unexpected disconnect events.
   *
   * To detect unexpected disconnects (e.g. to automatically notify your user), you should instead use
   * the UnexpectedReaderDisconnect event.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-connection-status-change.html)
   */
  addListener(
    eventName: TerminalEventsEnum.ConnectionStatusChange,
    listenerFunc: ({ status }: { status: ConnectionStatus }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * The Terminal disconnected unexpectedly from the reader.
   *
   * In your implementation of this method, you may want to notify your user that the reader disconnected.
   * You may also call [`discoverReaders()`](#discoverreaders) to begin scanning for readers, and attempt
   * to automatically reconnect to the disconnected reader. Be sure to either set a timeout or make it
   * possible to cancel calls to `discoverReaders()`
   *
   * When connected to a Bluetooth or USB reader, you can get more information about the disconnect by
   * implementing the DisconnectedReader event.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-unexpected-reader-disconnect.html)
   */
  addListener(
    eventName: TerminalEventsEnum.UnexpectedReaderDisconnect,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted after `confirmPaymentIntent()` succeeds. */
  addListener(
    eventName: TerminalEventsEnum.ConfirmedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted after `collectPaymentMethod()` succeeds. */
  addListener(
    eventName: TerminalEventsEnum.CollectedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when [`cancelCollectPaymentMethod()`](#cancelcollectpaymentmethod) is called and succeeds.
   * The Promise returned by `cancelCollectPaymentMethod()` will also be resolved.
   */
  addListener(eventName: TerminalEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when either [`collectPaymentMethod()`](#collectpaymentmethod) or [`confirmPaymentIntent()`](#confirmpaymentintent)
   * fails. The Promise returned by the relevant call will also be rejected.
   */
  addListener(
    eventName: TerminalEventsEnum.Failed,
    listenerFunc: (info: { message: string; code?: string; declineCode?: string }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when a software update is available for the connected reader.
   */
  addListener(
    eventName: TerminalEventsEnum.ReportAvailableUpdate,
    listenerFunc: ({ update }: { update: ReaderSoftwareUpdateInterface }) => void,
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
   * Your app should show UI to the user indicating that a software update is being installed
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
   * Emitted when reader software installation finishes. The callback contains
   * either the installed update or an error.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-finish-installing-update.html)
   */
  addListener(
    eventName: TerminalEventsEnum.FinishInstallingUpdate,
    listenerFunc: (
      args:
        | {
            update: ReaderSoftwareUpdateInterface;
          }
        | {
            error: string;
          },
    ) => void,
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
    listenerFunc: ({ level, charging, status }: { level: number; charging: boolean; status: BatteryStatus }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listenable/on-report-reader-event.html)
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderEvent,
    listenerFunc: ({ event }: { event: ReaderEvent }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   *
   * Emitted when the Terminal requests that a message be displayed in your app.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listener/on-request-reader-display-message.html)
   */
  addListener(
    eventName: TerminalEventsEnum.RequestDisplayMessage,
    listenerFunc: ({ messageType, message }: { messageType: ReaderDisplayMessage; message: string }) => void,
  ): Promise<PluginListenerHandle>;

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
    listenerFunc: ({ options, message }: { options: ReaderInputOption[]; message: string }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when the Terminal SDK's payment collection status changes.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-payment-status-change.html)
   */
  addListener(
    eventName: TerminalEventsEnum.PaymentStatusChange,
    listenerFunc: ({ status }: { status: PaymentStatus }) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted when automatic reader reconnection begins. */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectStarted,
    listenerFunc: ({ reader, reason }: { reader: ReaderInterface; reason: string }) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted when automatic reader reconnection succeeds. */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectSucceeded,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted when automatic reader reconnection fails. */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectFailed,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;
}
