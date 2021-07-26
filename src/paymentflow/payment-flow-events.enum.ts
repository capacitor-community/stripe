export enum PaymentFlowEventsEnum {
    Loaded = "paymentFlowLoaded",
    FailedToLoad = "paymentFlowFailedToLoad",
    Opened = "paymentFlowOpened",
    Created = "paymentFlowCreated",
    Completed = "paymentFlowCompleted",
    Canceled = "paymentFlowCanceled",
    Failed = "paymentFlowFailed",
}
export type PaymentFlowResultInterface =
  | PaymentFlowEventsEnum.Completed
  | PaymentFlowEventsEnum.Canceled
  | PaymentFlowEventsEnum.Failed;
