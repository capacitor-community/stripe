export enum TerminalEventsEnum {
  Loaded = 'terminalLoaded',
  DiscoveredReaders = 'terminalDiscoveredReaders',
  ConnectedReader = 'terminalConnectedReader',
  DisconnectedReader = 'terminalDisconnectedReader',
  Completed = 'terminalCompleted',
  Canceled = 'terminalCanceled',
  Failed = 'terminalFailed',
}

export type TerminalResultInterface =
  | TerminalEventsEnum.Completed
  | TerminalEventsEnum.Canceled
  | TerminalEventsEnum.Failed;
