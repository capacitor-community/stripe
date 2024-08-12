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
  LowBattery = 'LOW_BATTERY',
  LowBatterySucceedConnect = 'LOW_BATTERY_SUCCEED_CONNECT',
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

export enum BatteryStatus {
  Unknown = 'UNKNOWN',
  Critical = 'CRITICAL',
  Low = 'LOW',
  Nominal = 'NOMINAL',
}

export enum LocationStatus {
  NotSet = 'NOT_SET',
  Set = 'SET',
  Unknown = 'UNKNOWN',
}

export enum NetworkStatus {
  Unknown = 'UNKNOWN',
  Online = 'ONLINE',
  Offline = 'OFFLINE',
}

export enum ReaderEvent {
  Unknown = 'UNKNOWN',
  CardInserted = 'CARD_INSERTED',
  CardRemoved = 'CARD_REMOVED',
}

export enum ReaderDisplayMessage {
  CheckMobileDevice = 'CHECK_MOBILE_DEVICE',
  RetryCard = 'RETRY_CARD',
  InsertCard = 'INSERT_CARD',
  InsertOrSwipeCard = 'INSERT_OR_SWIPE_CARD',
  SwipeCard = 'SWIPE_CARD',
  RemoveCard = 'REMOVE_CARD',
  MultipleContactlessCardsDetected = 'MULTIPLE_CONTACTLESS_CARDS_DETECTED',
  TryAnotherReadMethod = 'TRY_ANOTHER_READ_METHOD',
  TryAnotherCard = 'TRY_ANOTHER_CARD',
  CardRemovedTooEarly = 'CARD_REMOVED_TOO_EARLY',
}

export enum ReaderInputOption {
  None = 'NONE',
  Insert = 'INSERT',
  Swipe = 'SWIPE',
  Tap = 'TAP',
  ManualEntry = 'MANUAL_ENTRY',
}

export enum PaymentStatus {
  Unknown = 'UNKNOWN',
  NotReady = 'NOT_READY',
  Ready = 'READY',
  WaitingForInput = 'WAITING_FOR_INPUT',
  Processing = 'PROCESSING',
}

export enum DisconnectReason {
  Unknown = 'UNKNOWN',
  DisconnectRequested = 'DISCONNECT_REQUESTED',
  RebootRequested = 'REBOOT_REQUESTED',
  SecurityReboot = 'SECURITY_REBOOT',
  CriticallyLowBattery = 'CRITICALLY_LOW_BATTERY',
  PoweredOff = 'POWERED_OFF',
  BluetoothDisabled = 'BLUETOOTH_DISABLED',
}

export enum ConnectionStatus {
  Unknown = 'UNKNOWN',
  NotConnected = 'NOT_CONNECTED',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
}
