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

/**
 * Snapshot of a Stripe Terminal reader returned by discovery or connection.
 *
 * @since 6.2.0
 */
export interface ReaderInterface {
  /**
   * Stable hardware serial number used as the reader's primary identifier.
   *
   * @since 6.2.0
   */
  serialNumber: string;

  /**
   * Human-readable reader label.
   *
   * @since 6.2.0
   */
  label: string;
  /**
   * Reader battery level from `0` to `1`.
   *
   * @since 6.2.0
   */
  batteryLevel: number;
  /**
   * Current reader battery status.
   *
   * @since 6.2.0
   */
  batteryStatus: BatteryStatus;
  /**
   * Whether this is a simulated reader.
   *
   * @since 6.2.0
   */
  simulated: boolean;
  /**
   * Platform-specific numeric reader identifier.
   *
   * @since 6.2.0
   */
  id: number;
  /**
   * Available reader software update, when one has been reported.
   *
   * @since 6.2.0
   */
  availableUpdate: ReaderSoftwareUpdateInterface | undefined;
  /**
   * Stripe Terminal Location ID assigned to the reader.
   *
   * @since 6.2.0
   */
  locationId: string;
  /**
   * Reader IP address when available.
   *
   * @since 6.2.0
   */
  ipAddress: string;
  /**
   * Current network status of the reader.
   *
   * @since 6.2.0
   */
  status: NetworkStatus;
  /**
   * Location details returned with the reader, when available.
   *
   * @since 6.2.0
   */
  location: LocationInterface | undefined;
  /**
   * Current location-assignment status.
   *
   * @since 6.2.0
   */
  locationStatus: LocationStatus;
  /**
   * Reader hardware type.
   *
   * @since 6.2.0
   */
  deviceType: DeviceType;
  /**
   * Installed reader software version, when reported by the SDK.
   *
   * @since 6.2.0
   */
  deviceSoftwareVersion: string | null;

  /**
   * iOS Only properties. These properties are not available on Android.
   *
   * @since 6.2.0
   */
  isCharging: number;

  /**
   * Android Only properties. These properties are not available on iOS.
   *
   * @since 6.2.0
   */
  baseUrl: string;
  /**
   * Android reader bootloader version.
   *
   * @since 6.2.0
   */
  bootloaderVersion: string;
  /**
   * Android reader configuration version.
   *
   * @since 6.2.0
   */
  configVersion: string;
  /**
   * Android reader EMV key-profile identifier.
   *
   * @since 6.2.0
   */
  emvKeyProfileId: string;
  /**
   * Android reader firmware version.
   *
   * @since 6.2.0
   */
  firmwareVersion: string;
  /**
   * Android reader hardware version.
   *
   * @since 6.2.0
   */
  hardwareVersion: string;
  /**
   * Android reader MAC key-profile identifier.
   *
   * @since 6.2.0
   */
  macKeyProfileId: string;
  /**
   * Android reader PIN key-profile identifier.
   *
   * @since 6.2.0
   */
  pinKeyProfileId: string;
  /**
   * Android reader track key-profile identifier.
   *
   * @since 6.2.0
   */
  trackKeyProfileId: string;
  /**
   * Android reader settings version.
   *
   * @since 6.2.0
   */
  settingsVersion: string;
  /**
   * Android reader PIN keyset identifier.
   *
   * @since 6.2.0
   */
  pinKeysetId: string;
}
/**
 * Stripe Terminal Location assigned to a reader.
 *
 * @since 6.2.0
 */
export interface LocationInterface {
  /**
   * Stripe Terminal Location ID.
   *
   * @since 6.2.0
   */
  id: string;
  /**
   * Display name configured for the location.
   *
   * @since 6.2.0
   */
  displayName: string;
  /**
   * Postal address configured for the location.
   *
   * @since 6.2.0
   */
  address: LocationAddress;
  /**
   * Location IP address when provided by the SDK.
   *
   * @since 6.2.0
   */
  ipAddress: string;
}

/**
 * Postal address configured for a Stripe Terminal Location.
 *
 * @since 6.2.0
 */
export interface LocationAddress {
  /**
   * City, district, suburb, town, or village.
   *
   * @since 6.2.0
   */
  city: string;
  /**
   * Two-letter ISO 3166-1 country code.
   *
   * @since 6.2.0
   */
  country: string;
  /**
   * ZIP or postal code.
   *
   * @since 6.2.0
   */
  postalCode: string;
  /**
   * Primary address line.
   *
   * @since 6.2.0
   */
  line1: string;
  /**
   * Secondary address line.
   *
   * @since 6.2.0
   */
  line2: string;
  /**
   * State, county, province, or region.
   *
   * @since 6.2.0
   */
  state: string;
}

/**
 * Metadata for an available reader software update.
 *
 * @since 6.1.0
 */
export interface ReaderSoftwareUpdateInterface {
  /**
   * Software version offered by the update.
   *
   * @since 6.1.0
   */
  deviceSoftwareVersion: string;
  /**
   * Estimated duration of the update.
   *
   * @since 6.1.0
   */
  estimatedUpdateTime: UpdateTimeEstimate;
  /**
   * Unix timestamp after which the update becomes required.
   *
   * @since 6.1.0
   */
  requiredAt: number;
}

/**
 * Line item displayed on a reader's customer-facing screen.
 *
 * @since 6.2.0
 */
export interface CartLineItem {
  /**
   * Item name shown on the reader.
   *
   * @since 6.2.0
   */
  displayName: string;
  /**
   * Number of units in the cart.
   *
   * @since 6.2.0
   */
  quantity: number;
  /**
   * Line-item amount in the currency's smallest unit.
   *
   * @since 6.2.0
   */
  amount: number;
}

/**
 * Cart totals displayed on a reader's customer-facing screen.
 *
 * @since 6.2.0
 */
export interface Cart {
  /**
   * Three-letter ISO 4217 currency code.
   *
   * @since 6.2.0
   */
  currency: string;
  /**
   * Tax amount in the currency's smallest unit.
   *
   * @since 6.2.0
   */
  tax: number;
  /**
   * Cart total in the currency's smallest unit.
   *
   * @since 6.2.0
   */
  total: number;
  /**
   * Items displayed in the cart.
   *
   * @since 6.2.0
   */
  lineItems: CartLineItem[];
}

/**
 * Color value for TapToPayUxConfiguration.
 * Use 'default' to use Stripe's default color, or a hex string like '#965D35'.
 *
 * @since 8.1.0
 */
export type TapToPayColor = 'default' | string;

/**
 * Dark mode setting for Tap to Pay UX.
 *
 * @since 8.1.0
 */
export enum TapToPayDarkMode {
  System = 'SYSTEM',
  Dark = 'DARK',
  Light = 'LIGHT',
}

/**
 * Color scheme for the Tap to Pay screen.
 *
 * @since 8.1.0
 */
export interface TapToPayColorScheme {
  /**
   * Primary color for the tap-zone indicator. Use a hex string or `default`.
   *
   * @since 8.1.0
   */
  primary?: TapToPayColor;
  /**
   * Success-state color. Use a hex string or `default`.
   *
   * @since 8.1.0
   */
  success?: TapToPayColor;
  /**
   * Error-state color. Use a hex string or `default`.
   *
   * @since 8.1.0
   */
  error?: TapToPayColor;
}

/**
 * Tap zone position configuration.
 * Controls where the tap indicator appears on screen.
 *
 * @since 8.1.0
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
 *
 * @since 8.1.0
 */
export interface TapToPayUxConfiguration {
  /**
   * Color scheme for the Tap to Pay screen.
   *
   * @since 8.1.0
   */
  colors?: TapToPayColorScheme;
  /**
   * Dark-mode setting for the Tap to Pay screen.
   *
   * @since 8.1.0
   */
  darkMode?: TapToPayDarkMode;
  /**
   * Position of the tap indicator on screen.
   *
   * @since 8.1.0
   */
  tapZone?: TapToPayTapZone;
}

/**
 * Options for isTapToPayAccountLinked.
 *
 * @since 8.2.0
 */
export interface IsTapToPayAccountLinkedOptions {
  /**
   * Connected account ID, for Stripe Connect platforms.
   * Omit to check the account that owns the API key.
   *
   * @since 8.2.0
   */
  onBehalfOf?: string;
}

export interface DiscoverReadersOptions {
  /**
   * Discovery method and reader transport to use.
   *
   * @since 5.1.0
   */
  type: TerminalConnectTypes;
  /**
   * Stripe Terminal Location ID used to scope internet reader discovery and
   * reader registration where required.
   *
   * @since 5.1.0
   */
  locationId?: string;

  /**
   * Only applies to Bluetooth scan discovery (iOS only).
   * During discovery, readers are reported via DiscoveryDelegate.didUpdateDiscoveredReaders.
   * This timeout controls how long to wait before resolving the `discoverReaders` method with the current list.
   *
   * If this setting is not specified or is set to 0, the initial scan results will be returned.
   *
   * @since 7.2.0
   */
  bluetoothScanWaitTime?: number;
}

export interface StripeTerminalInitializationOptions {
  /**
   * HTTPS endpoint that creates a new Stripe Terminal connection token.
   *
   * @since 5.1.0
   */
  tokenProviderEndpoint?: string;
  /**
   * Enables simulated discovery and readers where supported.
   *
   * @since 5.1.0
   */
  isTest: boolean;
}

export interface SetConnectionTokenOptions {
  /**
   * Secret returned by the Stripe Connection Token API.
   *
   * @since 5.4.5
   */
  token: string;
}

export interface SimulatorConfigurationOptions {
  /**
   * Simulated reader-update scenario.
   *
   * @since 6.1.0
   */
  update?: SimulateReaderUpdate;
  /**
   * Simulated card presented during collection.
   *
   * @since 6.1.0
   */
  simulatedCard?: SimulatedCardType;
  /**
   * Simulated tip amount in the PaymentIntent currency's smallest unit.
   *
   * @since 6.1.0
   */
  simulatedTipAmount?: number;
}

export interface ConnectReaderOptions {
  /**
   * Reader selected from the latest discovery result.
   *
   * @since 5.1.0
   */
  reader: ReaderInterface;
  /**
   * Automatically attempts to reconnect after an unexpected disconnect.
   *
   * @default false
   * @since 6.2.0
   */
  autoReconnectOnUnexpectedDisconnect?: boolean;

  /**
   * Merchant name displayed by local mobile readers. iOS only; on Android
   * configure the merchant name on the PaymentIntent.
   *
   * @since 6.2.0
   */
  merchantDisplayName?: string;

  /**
   * Stripe connected-account ID for which the funds are intended. iOS local
   * mobile readers only; on Android configure it on the PaymentIntent.
   *
   * @since 6.2.0
   */
  onBehalfOf?: string;
}

export interface CollectPaymentMethodOptions {
  /**
   * Client secret of a PaymentIntent configured for `card_present`.
   *
   * @since 5.5.0
   */
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
   *
   * @since 5.1.0
   */
  initialize(options: StripeTerminalInitializationOptions): Promise<void>;
  /**
   * Discovers readers using the requested transport. The returned readers are
   * snapshots; listen for `DiscoveredReaders` when continuous discovery can
   * produce additional results.
   *
   * @since 5.1.0
   */
  discoverReaders(options: DiscoverReadersOptions): Promise<{
    readers: ReaderInterface[];
  }>;
  /**
   * Supplies a connection-token secret after `RequestedConnectionToken` is
   * emitted. Create each token on your server and use it only once.
   *
   * @since 5.4.5
   */
  setConnectionToken(options: SetConnectionTokenOptions): Promise<void>;
  /**
   * Configures the simulated reader used in test mode. Call before the
   * operation whose behavior you want to simulate.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.models/-simulator-configuration/index.html)
   *
   * @since 6.1.0
   */
  setSimulatorConfiguration(options: SimulatorConfigurationOptions): Promise<void>;

  /**
   * Connects to a reader returned by `discoverReaders()`.
   *
   * @since 5.1.0
   */
  connectReader(options: ConnectReaderOptions): Promise<void>;
  /**
   * Returns the currently connected reader, or `null` when disconnected.
   *
   * @since 5.1.1
   */
  getConnectedReader(): Promise<{ reader: ReaderInterface | null }>;
  /**
   * Disconnects the active reader. Resolves immediately if none is connected.
   *
   * @since 5.1.1
   */
  disconnectReader(): Promise<void>;
  /**
   * Cancels the active reader-discovery operation.
   *
   * @since 5.1.1
   */
  cancelDiscoverReaders(): Promise<void>;
  /**
   * Collects a payment method for a server-created PaymentIntent. Confirm the
   * collected intent with `confirmPaymentIntent()`.
   *
   * @since 5.5.0
   */
  collectPaymentMethod(options: CollectPaymentMethodOptions): Promise<void>;
  /**
   * Cancels an in-progress `collectPaymentMethod()` call.
   *
   * @since 5.5.0
   */
  cancelCollectPaymentMethod(): Promise<void>;
  /**
   * Confirms the PaymentIntent most recently collected by the reader.
   *
   * @since 5.5.0
   */
  confirmPaymentIntent(): Promise<void>;
  /**
   * Installs the software update reported by `ReportAvailableUpdate`.
   *
   * @since 6.2.0
   */
  installAvailableUpdate(): Promise<void>;
  /**
   * Cancels an in-progress optional reader software update.
   *
   * @since 6.2.0
   */
  cancelInstallUpdate(): Promise<void>;
  /**
   * Displays cart details on a reader with a customer-facing display.
   *
   * @since 6.2.0
   */
  setReaderDisplay(options: Cart): Promise<void>;
  /**
   * Clears cart details from the reader's customer-facing display.
   *
   * @since 6.2.0
   */
  clearReaderDisplay(): Promise<void>;
  /**
   * Reboots the connected reader. Supported reader types are platform dependent.
   *
   * @since 6.2.0
   */
  rebootReader(): Promise<void>;
  /**
   * Cancels an automatic reader reconnection attempt.
   *
   * @since 6.2.0
   */
  cancelReaderReconnection(): Promise<void>;

  /**
   * Configure the Tap to Pay UX appearance (Android only).
   * Call this after initialize() but before connectReader().
   * Has no effect on iOS or web platforms.
   *
   * @since 8.1.0
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
   *
   * @since 8.2.0
   */
  isTapToPayAccountLinked(options?: IsTapToPayAccountLinkedOptions): Promise<{ isLinked: boolean }>;

  /**
   * Emitted after the Terminal SDK has initialized.
   *
   * @since 5.1.0
   */
  addListener(eventName: TerminalEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the SDK needs a connection token and no token endpoint was
   * configured. Respond by calling `setConnectionToken()`.
   *
   * @since 5.1.0
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
   *
   * @since 5.1.0
   */
  addListener(
    eventName: TerminalEventsEnum.DiscoveredReaders,
    listenerFunc: ({ readers }: { readers: ReaderInterface[] }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after a reader connects successfully.
   *
   * @since 5.1.0
   */
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
   *
   * @since 6.2.0
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
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
   */
  addListener(
    eventName: TerminalEventsEnum.UnexpectedReaderDisconnect,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after `confirmPaymentIntent()` succeeds.
   *
   * @since 5.5.0
   */
  addListener(
    eventName: TerminalEventsEnum.ConfirmedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after `collectPaymentMethod()` succeeds.
   *
   * @since 5.5.0
   */
  addListener(
    eventName: TerminalEventsEnum.CollectedPaymentIntent,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when [`cancelCollectPaymentMethod()`](#cancelcollectpaymentmethod) is called and succeeds.
   * The Promise returned by `cancelCollectPaymentMethod()` will also be resolved.
   *
   * @since 5.5.0
   */
  addListener(eventName: TerminalEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when either [`collectPaymentMethod()`](#collectpaymentmethod) or [`confirmPaymentIntent()`](#confirmpaymentintent)
   * fails. The Promise returned by the relevant call will also be rejected.
   *
   * @since 5.5.0
   */
  addListener(
    eventName: TerminalEventsEnum.Failed,
    listenerFunc: (info: { message: string; code?: string; declineCode?: string }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when a software update is available for the connected reader.
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
   */
  addListener(
    eventName: TerminalEventsEnum.BatteryLevel,
    listenerFunc: ({ level, charging, status }: { level: number; charging: boolean; status: BatteryStatus }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * **Only applicable to Bluetooth and USB readers.**
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-reader-listenable/on-report-reader-event.html)
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
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
   *
   * @since 6.1.0
   */
  addListener(
    eventName: TerminalEventsEnum.RequestReaderInput,
    listenerFunc: ({ options, message }: { options: ReaderInputOption[]; message: string }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when the Terminal SDK's payment collection status changes.
   *
   * [*Stripe docs reference*](https://stripe.dev/stripe-terminal-android/external/com.stripe.stripeterminal.external.callable/-terminal-listener/on-payment-status-change.html)
   *
   * @since 6.1.0
   */
  addListener(
    eventName: TerminalEventsEnum.PaymentStatusChange,
    listenerFunc: ({ status }: { status: PaymentStatus }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when automatic reader reconnection begins.
   *
   * @since 6.2.0
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectStarted,
    listenerFunc: ({ reader, reason }: { reader: ReaderInterface; reason: string }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when automatic reader reconnection succeeds.
   *
   * @since 6.2.0
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectSucceeded,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted when automatic reader reconnection fails.
   *
   * @since 6.2.0
   */
  addListener(
    eventName: TerminalEventsEnum.ReaderReconnectFailed,
    listenerFunc: ({ reader }: { reader: ReaderInterface }) => void,
  ): Promise<PluginListenerHandle>;
}
