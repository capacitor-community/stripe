export enum EmbeddedPaymentElementEventsEnum {
  Change = 'embeddedPaymentElementChange',
  Completed = 'embeddedPaymentElementCompleted',
  Canceled = 'embeddedPaymentElementCanceled',
  Failed = 'embeddedPaymentElementFailed',
}

export type EmbeddedPaymentElementResultInterface =
  | EmbeddedPaymentElementEventsEnum.Completed
  | EmbeddedPaymentElementEventsEnum.Canceled
  | EmbeddedPaymentElementEventsEnum.Failed;
