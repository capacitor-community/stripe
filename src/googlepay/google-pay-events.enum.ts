export enum GooglePayEventsEnum {
  Loaded = "googlePayLoaded",
  FailedToLoad = "googlePayFailedToLoad",
  Completed = "googlePayCompleted",
  Canceled = "googlePayCanceled",
  Failed = "googlePayFailed"
}
export type  GooglePayResultInterface =
  | GooglePayEventsEnum.Completed
  | GooglePayEventsEnum.Canceled
  | GooglePayEventsEnum.Failed
