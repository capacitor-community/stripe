export enum PaymentSheetEventsEnum {
    Loaded = "paymentSheetLoaded",
    FailedToLoad = "paymentSheetFailedToLoad",
    Completed = "paymentSheetCompleted",
    Canceled = "paymentSheetCanceled",
    Failed = "paymentSheetFailed"
}

export type PaymentSheetResultInterface =
    PaymentSheetEventsEnum.Completed
    | PaymentSheetEventsEnum.Canceled
    | PaymentSheetEventsEnum.Failed
