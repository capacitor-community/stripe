export enum PaymentSheetEventsEnum {
    Loaded = "paymentSheetLoaded",
    FailedToLoad = "paymentSheetFailedToLoad",
    Completed = "paymentSheetCompleted",
    Canceled = "paymentSheetCanceled",
    Failed = "paymentSheetFailed",
}

export type PaymentSheetResult =
    PaymentSheetEventsEnum.Loaded
    | PaymentSheetEventsEnum.FailedToLoad
    | PaymentSheetEventsEnum.Completed
    | PaymentSheetEventsEnum.Canceled
    | PaymentSheetEventsEnum.Failed;
