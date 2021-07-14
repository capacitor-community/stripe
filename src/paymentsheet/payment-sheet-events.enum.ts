export enum PaymentSheetEventsEnum {
  Loaded = "paymentSheetLoaded",
  FailedToLoad = "paymentSheetFailedToLoad",
  Completed = "paymentSheetCompleted",
  Canceled = "paymentSheetCanceled",
  Failed = "paymentSheetFailed",
}

export type PaymentSheetResult = PaymentSheetEventsEnum.Completed | PaymentSheetEventsEnum.Completed | PaymentSheetEventsEnum.Failed;
