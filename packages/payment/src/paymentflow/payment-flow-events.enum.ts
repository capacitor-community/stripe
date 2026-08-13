export enum PaymentFlowEventsEnum {
  Loaded = 'paymentFlowLoaded',
  FailedToLoad = 'paymentFlowFailedToLoad',
  Opened = 'paymentFlowOpened',
  Created = 'paymentFlowCreated',
  Completed = 'paymentFlowCompleted',
  Canceled = 'paymentFlowCanceled',
  Failed = 'paymentFlowFailed',
}
/** Final result returned after confirming PaymentFlow. */
export type PaymentFlowResultInterface =
  | PaymentFlowEventsEnum.Completed
  | PaymentFlowEventsEnum.Canceled
  | PaymentFlowEventsEnum.Failed;
