package com.getcapacitor.community.stripe.terminal;

enum class TerminalEnumEvent(val webEventName: String) {
    Loaded("terminalLoaded"),
    DiscoveredReaders("terminalDiscoveredReaders"),
    CancelDiscoveredReaders("terminalCancelDiscoveredReaders"),
    ConnectedReader("terminalConnectedReader"),
    DisconnectedReader("terminalDisconnectedReader"),
    ConfirmedPaymentIntent("terminalConfirmedPaymentIntent"),
    CollectedPaymentIntent("terminalCollectedPaymentIntent"),
    Canceled("terminalCanceled"),
    Failed("terminalFailed"),
    RequestedConnectionToken("terminalRequestedConnectionToken"),
}
