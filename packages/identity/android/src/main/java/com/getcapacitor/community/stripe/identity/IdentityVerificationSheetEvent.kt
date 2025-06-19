package com.getcapacitor.community.stripe.identity;


enum class IdentityVerificationSheetEvent(val webEventName: String) {
    Loaded("identityVerificationSheetLoaded"),
    FailedToLoad("identityVerificationSheetFailedToLoad"),
    Completed("identityVerificationSheetCompleted"),
    Canceled("identityVerificationSheetCanceled"),
    Failed("identityVerificationSheetFailed"),
    VerificationResult("identityVerificationResult"),
}
