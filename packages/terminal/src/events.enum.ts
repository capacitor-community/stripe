export enum TerminalEventsEnum {
  Loaded = 'terminalLoaded',
  DiscoveredReaders = 'terminalDiscoveredReaders',
  CancelDiscoveredReaders = 'terminalCancelDiscoveredReaders',
  ConnectedReader = 'terminalConnectedReader',
  DisconnectedReader = 'terminalDisconnectedReader',
  ConfirmedPaymentIntent = 'terminalConfirmedPaymentIntent',
  CollectedPaymentIntent = 'terminalCollectedPaymentIntent',
  Canceled = 'terminalCanceled',
  Failed = 'terminalFailed',
  RequestedConnectionToken = 'terminalRequestedConnectionToken',
  StartInstallingUpdate = 'terminalStartInstallingUpdate',
  ReaderSoftwareUpdateProgress = 'terminalReaderSoftwareUpdateProgress',
  FinishInstallingUpdate = 'terminalFinishInstallingUpdate',
  BatteryLevel = 'terminalBatteryLevel',
}

export type TerminalResultInterface =
  | TerminalEventsEnum.ConfirmedPaymentIntent
  | TerminalEventsEnum.CollectedPaymentIntent
  | TerminalEventsEnum.Canceled
  | TerminalEventsEnum.Failed;
