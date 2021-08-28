export enum ApplePayEventsEnum {
  Loaded = "applePayLoaded",
  FailedToLoad = "applePayFailedToLoad",
  Completed = "applePayCompleted",
  Canceled = "applePayCanceled",
  Failed = "applePayFailed",
}
export type  ApplePayResultInterface =
  | ApplePayEventsEnum.Completed
  | ApplePayEventsEnum.Canceled
  | ApplePayEventsEnum.Failed;
