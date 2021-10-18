export declare enum GooglePayEventsEnum {
    Loaded = "googlePayLoaded",
    FailedToLoad = "googlePayFailedToLoad",
    Completed = "googlePayCompleted",
    Canceled = "googlePayCanceled",
    Failed = "googlePayFailed"
}
export declare type GooglePayResultInterface = GooglePayEventsEnum.Completed | GooglePayEventsEnum.Canceled | GooglePayEventsEnum.Failed;
