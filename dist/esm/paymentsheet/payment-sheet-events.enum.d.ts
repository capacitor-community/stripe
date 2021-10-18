export declare enum PaymentSheetEventsEnum {
    Loaded = "paymentSheetLoaded",
    FailedToLoad = "paymentSheetFailedToLoad",
    Completed = "paymentSheetCompleted",
    Canceled = "paymentSheetCanceled",
    Failed = "paymentSheetFailed"
}
export declare type PaymentSheetResultInterface = PaymentSheetEventsEnum.Loaded | PaymentSheetEventsEnum.FailedToLoad | PaymentSheetEventsEnum.Completed | PaymentSheetEventsEnum.Canceled | PaymentSheetEventsEnum.Failed;
