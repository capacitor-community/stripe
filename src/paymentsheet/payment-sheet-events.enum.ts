export enum PaymentSheetEventsEnum {
    Loaded = "paymentSheetLoaded",
    FailedToLoad = "paymentSheetFailedToLoad",
    Completed = "paymentSheetCompleted",
    Canceled = "paymentSheetCanceled",
    Failed = "paymentSheetFailed",
    DidSelectShippingContact = "didSelectShippingContact",
    DidCreatePaymentMethod = "didCreatePaymentMethod",
}

export type PaymentSheetResultInterface =
    PaymentSheetEventsEnum.Completed
    | PaymentSheetEventsEnum.Canceled
    | PaymentSheetEventsEnum.Failed
    | PaymentSheetEventsEnum.DidSelectShippingContact
    | PaymentSheetEventsEnum.DidCreatePaymentMethod;
