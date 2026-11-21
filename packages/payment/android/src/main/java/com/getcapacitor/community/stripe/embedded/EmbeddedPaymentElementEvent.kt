package com.getcapacitor.community.stripe.embedded

internal enum class EmbeddedPaymentElementEvents(val webEventName: String) {
    Change("embeddedPaymentElementChange"),
    Completed("embeddedPaymentElementCompleted"),
    Canceled("embeddedPaymentElementCanceled"),
    Failed("embeddedPaymentElementFailed"),
}
