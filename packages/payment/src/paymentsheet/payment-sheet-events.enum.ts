export enum PaymentSheetEventsEnum {
  Loaded = 'paymentSheetLoaded',
  FailedToLoad = 'paymentSheetFailedToLoad',
  Completed = 'paymentSheetCompleted',
  Canceled = 'paymentSheetCanceled',
  Failed = 'paymentSheetFailed',
}

/** Final result returned after presenting PaymentSheet. */
export type PaymentSheetResultInterface =
  | PaymentSheetEventsEnum.Completed
  | PaymentSheetEventsEnum.Canceled
  | PaymentSheetEventsEnum.Failed;
