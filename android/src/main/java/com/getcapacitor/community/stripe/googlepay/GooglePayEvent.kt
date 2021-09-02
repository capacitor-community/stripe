package com.getcapacitor.community.stripe.googlepay;

enum class GooglePayEvents(val webEventName: String) {
    Loaded("googlePlayLoaded"),
    FailedToLoad("googlePlayFailedToLoad"),
    Completed("googlePlayCompleted"),
    Canceled("googlePlayCanceled"),
    Failed("googlePlayFailed"),
}
