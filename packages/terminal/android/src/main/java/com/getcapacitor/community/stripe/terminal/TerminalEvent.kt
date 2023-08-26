package com.getcapacitor.community.stripe.terminal;

enum class TerminalEnumEvent(val webEventName: String) {
    Loaded("terminalLoaded"),
    DiscoveredReaders("terminalDiscoveredReaders"),
    CancelDiscoveredReaders("terminalCancelDiscoveredReaders"),
    ConnectedReader("terminalConnectedReader"),
    DisconnectedReader("terminalDisconnectedReader"),
    Completed("terminalCompleted"),
    Canceled("terminalCanceled"),
    Failed("terminalFailed"),
}
