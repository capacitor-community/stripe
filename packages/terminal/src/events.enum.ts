export enum TerminalEventsEnum {
  Loaded = 'terminalLoaded',
  DiscoveredReaders = 'terminalDiscoveredReaders',
  CancelDiscoveredReaders = 'terminalCancelDiscoveredReaders',
  ConnectedReader = 'terminalConnectedReader',
  DisconnectedReader = 'terminalDisconnectedReader',
  ConnectionStatusChange = 'terminalConnectionStatusChange',
  UnexpectedReaderDisconnect = 'terminalUnexpectedReaderDisconnect',
  ConfirmedPaymentIntent = 'terminalConfirmedPaymentIntent',
  CollectedPaymentIntent = 'terminalCollectedPaymentIntent',
  Canceled = 'terminalCanceled',
  Failed = 'terminalFailed',
  RequestedConnectionToken = 'terminalRequestedConnectionToken',
  ReportAvailableUpdate = 'terminalReportAvailableUpdate',
  StartInstallingUpdate = 'terminalStartInstallingUpdate',
  ReaderSoftwareUpdateProgress = 'terminalReaderSoftwareUpdateProgress',
  FinishInstallingUpdate = 'terminalFinishInstallingUpdate',
  BatteryLevel = 'terminalBatteryLevel',
  ReaderEvent = 'terminalReaderEvent',
  RequestDisplayMessage = 'terminalRequestDisplayMessage',
  RequestReaderInput = 'terminalRequestReaderInput',
  PaymentStatusChange = 'terminalPaymentStatusChange',
}

export type TerminalResultInterface =
  | TerminalEventsEnum.ConfirmedPaymentIntent
  | TerminalEventsEnum.CollectedPaymentIntent
  | TerminalEventsEnum.Canceled
  | TerminalEventsEnum.Failed;
