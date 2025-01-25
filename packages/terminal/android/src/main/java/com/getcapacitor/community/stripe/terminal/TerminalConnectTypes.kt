package com.getcapacitor.community.stripe.terminal;

enum class TerminalConnectTypes(val webEventName: String) {
    Simulated("simulated"),
    Internet("internet"),
    Bluetooth("bluetooth"),
    Usb("usb"),
    TapToPay("tap-to-pay"),
    HandOff("hand-off"),
}
