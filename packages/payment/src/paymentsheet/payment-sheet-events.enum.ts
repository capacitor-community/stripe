export enum PaymentSheetEventsEnum {
  Loaded = 'paymentSheetLoaded',
  FailedToLoad = 'paymentSheetFailedToLoad',
  Completed = 'paymentSheetCompleted',
  Canceled = 'paymentSheetCanceled',
  Failed = 'paymentSheetFailed',
}

/**
 * Final result returned after presenting PaymentSheet.
 *
 * @since 3.0.0
 */
export type PaymentSheetResultInterface =
  | PaymentSheetEventsEnum.Completed
  | PaymentSheetEventsEnum.Canceled
  | PaymentSheetEventsEnum.Failed;
