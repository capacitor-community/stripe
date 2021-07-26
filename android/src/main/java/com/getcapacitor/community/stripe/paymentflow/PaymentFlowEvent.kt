package com.getcapacitor.community.stripe.paymentflow;

enum class PaymentFlowEvents(val webEventName: String) {
    Loaded("paymentFlowLoaded"),
    FailedToLoad("paymentFlowFailedToLoad"),
    Opened("paymentFlowOpened"),
    FailedToOpen("paymentFlowFailedToOpen"),
    Completed("paymentFlowCompleted"),
    Canceled("paymentFlowCanceled"),
    Failed("paymentFlowFailed"),
    Created("paymentFlowCreated"),
}
