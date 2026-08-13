export enum GooglePayEventsEnum {
  Loaded = 'googlePayLoaded',
  FailedToLoad = 'googlePayFailedToLoad',
  Completed = 'googlePayCompleted',
  Canceled = 'googlePayCanceled',
  Failed = 'googlePayFailed',
}
/** Final result returned after presenting Google Pay. */
export type GooglePayResultInterface =
  | GooglePayEventsEnum.Completed
  | GooglePayEventsEnum.Canceled
  | GooglePayEventsEnum.Failed;
