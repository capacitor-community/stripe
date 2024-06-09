import type { PluginListenerHandle } from '@capacitor/core';

import type { TerminalEventsEnum } from './events.enum';

export enum TerminalConnectTypes {
  Simulated = 'simulated',
  Internet = 'internet',
  Bluetooth = 'bluetooth',
  Usb = 'usb',
  TapToPay = 'tap-to-pay',
}

export enum UpdateTimeEstimate {
  LessThanOneMinute = 'LESS_THAN_ONE_MINUTE',
  OneToTwoMinutes = 'ONE_TO_TWO_MINUTES',
  TwoToFiveMinutes = 'TWO_TO_FIVE_MINUTES',
  FiveToFifteenMinutes = 'FIVE_TO_FIFTEEN_MINUTES',
}

export enum SimulateReaderUpdate {
  UpdateAvailable = 'UPDATE_AVAILABLE',
  None = 'NONE',
  Required = 'REQUIRED',
  Random = 'RANDOM',
}

export enum SimulatedCardType {
  Visa = 'VISA',
  VisaDebit = 'VISA_DEBIT',
  Mastercard = 'MASTERCARD',
  MastercardDebit = 'MASTERCARD_DEBIT',
  MastercardPrepaid = 'MASTERCARD_PREPAID',
  Amex = 'AMEX',
  Amex2 = 'AMEX_2',
  Discover = 'DISCOVER',
  Discover2 = 'DISCOVER_2',
  DinersClub = 'DINERS',
  DinersClulb14Digits = 'DINERS_14_DIGITS',
  JCB = 'JCB',
  UnionPay = 'UNION_PAY',
  Interac = 'INTERAC',
  EftposAustraliaDebit = 'EFTPOS_AU_DEBIT',
  VisaUsCommonDebit = 'VISA_US_COMMON_DEBIT',
  ChargeDeclined = 'CHARGE_DECLINED',
  ChargeDeclinedInsufficientFunds = 'CHARGE_DECLINED_INSUFFICIENT_FUNDS',
  ChargeDeclinedLostCard = 'CHARGE_DECLINED_LOST_CARD',
  ChargeDeclinedStolenCard = 'CHARGE_DECLINED_STOLEN_CARD',
  ChargeDeclinedExpiredCard = 'CHARGE_DECLINED_EXPIRED_CARD',
  ChargeDeclinedProcessingError = 'CHARGE_DECLINED_PROCESSING_ERROR',
  EftposAustraliaVisaDebit = 'EFTPOS_AU_VISA_DEBIT',
  EftposAustraliaMastercardDebit = 'EFTPOS_AU_DEBIT_MASTERCARD',
  OfflinePinCVM = 'OFFLINE_PIN_CVM',
  OfflinePinSCARetry = 'OFFLINE_PIN_SCA_RETRY',
  OnlinePinCVM = 'ONLINE_PIN_CVM',
  OnlinePinSCARetry = 'ONLINE_PIN_SCA_RETRY',
}

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
