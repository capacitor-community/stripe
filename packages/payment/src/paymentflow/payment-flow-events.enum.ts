export enum PaymentFlowEventsEnum {
  Loaded = 'paymentFlowLoaded',
  FailedToLoad = 'paymentFlowFailedToLoad',
  Opened = 'paymentFlowOpened',
  Created = 'paymentFlowCreated',
  Completed = 'paymentFlowCompleted',
  Canceled = 'paymentFlowCanceled',
  Failed = 'paymentFlowFailed',
}
/**
 * Final result returned after confirming PaymentFlow.
 *
 * @since 3.0.2
 */
export type PaymentFlowResultInterface =
  | PaymentFlowEventsEnum.Completed
  | PaymentFlowEventsEnum.Canceled
  | PaymentFlowEventsEnum.Failed;
