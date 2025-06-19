public enum IdentityVerificationSheetEvents: String {
    case Loaded = "identityVerificationSheetLoaded"
    case FailedToLoad = "identityVerificationSheetFailedToLoad"
    case Completed = "identityVerificationSheetCompleted"
    case Canceled = "identityVerificationSheetCanceled"
    case Failed = "identityVerificationSheetFailed"
    case VerificationResult = "identityVerificationResult"
}
