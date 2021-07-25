public enum PaymentFlowEvents: String {
    case Loaded = "paymentFlowLoaded"
    case FailedToLoad = "paymentFlowFailedToLoad"
    case Opened = "paymentFlowOpened"
    case FailedToOpen = "paymentFlowFailedToOpen"
    case Completed = "paymentFlowCompleted"
    case Canceled = "paymentFlowCanceled"
    case Failed = "paymentFlowFailed"
    case Created = "paymentFlowCreated"
}
