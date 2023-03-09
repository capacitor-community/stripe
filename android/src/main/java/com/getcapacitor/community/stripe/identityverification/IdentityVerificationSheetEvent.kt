package com.getcapacitor.community.stripe.identityverification;

enum class IdentityVerificationSheetEvent(val webEventName: String) {
    Loaded("identityVerificationSheetLoaded"),
    FailedToLoad("identityVerificationSheetFailedToLoad"),
    Completed("identityVerificationSheetCompleted"),
    Canceled("identityVerificationSheetCanceled"),
    Failed("identityVerificationSheetFailed"),
}
