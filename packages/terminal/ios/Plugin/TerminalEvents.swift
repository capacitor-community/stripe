public enum TerminalEvents: String {
    case Loaded = "terminalLoaded"
    case DiscoveredReaders = "terminalDiscoveredReaders"
    case ConnectedReader = "terminalConnectedReader"
    case DisconnectedReader = "terminalDisconnectedReader"
    case Completed = "terminalCompleted"
    case Canceled = "terminalCanceled"
    case Failed = "terminalFailed"
}
