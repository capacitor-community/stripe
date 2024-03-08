export enum TerminalEventsEnum {
  Loaded = 'terminalLoaded',
  DiscoveredReaders = 'terminalDiscoveredReaders',
  CancelDiscoveredReaders = 'terminalCancelDiscoveredReaders',
  ConnectedReader = 'terminalConnectedReader',
  DisconnectedReader = 'terminalDisconnectedReader',
  Completed = 'terminalCompleted',
  Canceled = 'terminalCanceled',
  Failed = 'terminalFailed',
  RequestedConnectionToken = 'terminalRequestedConnectionToken',
}

export type TerminalResultInterface =
  | TerminalEventsEnum.Completed
  | TerminalEventsEnum.Canceled
  | TerminalEventsEnum.Failed;
