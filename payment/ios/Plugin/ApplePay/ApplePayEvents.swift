public enum ApplePayEvents: String {
    case Loaded = "applePayLoaded"
    case FailedToLoad = "applePayFailedToLoad"
    case Completed = "applePayCompleted"
    case Canceled = "applePayCanceled"
    case Failed = "applePayFailed"
    case DidSelectShippingContact = "applePayDidSelectShippingContact"
    case DidCreatePaymentMethod = "applePayDidCreatePaymentMethod"
}
