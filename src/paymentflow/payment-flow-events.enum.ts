export enum PaymentFlowEventsEnum {
    Loaded = "paymentFlowLoaded",
    FailedToLoad = "paymentFlowFailedToLoad",
    Opened = "paymentFlowOpen",
    FailedToOpened = "paymentFlowFailedToOpened",
    Completed = "paymentFlowCompleted",
    Canceled = "paymentFlowCanceled",
    Failed = "paymentFlowFailed",
    Created = "paymentFlowCreated",
}
export type PaymentFlowResultInterface =
  | PaymentFlowEventsEnum.Completed
  | PaymentFlowEventsEnum.Canceled
  | PaymentFlowEventsEnum.Failed;
