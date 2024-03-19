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
}

export type TerminalResultInterface =
  | TerminalEventsEnum.ConfirmedPaymentIntent
  | TerminalEventsEnum.CollectedPaymentIntent
  | TerminalEventsEnum.Canceled
  | TerminalEventsEnum.Failed;
