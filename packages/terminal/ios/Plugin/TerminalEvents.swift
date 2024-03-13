public enum TerminalEvents: String {
    case Loaded = "terminalLoaded"
    case DiscoveredReaders = "terminalDiscoveredReaders"
    case ConnectedReader = "terminalConnectedReader"
    case DisconnectedReader = "terminalDisconnectedReader"
    case ConfirmedPaymentIntent = "terminalConfirmedPaymentIntent"
    case CollectedPaymentIntent = "terminalCollectedPaymentIntent"
    case Canceled = "terminalCanceled"
    case Failed = "terminalFailed"
    case RequestedConnectionToken = "terminalRequestedConnectionToken"
}
