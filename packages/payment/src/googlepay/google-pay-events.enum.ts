export enum GooglePayEventsEnum {
  Loaded = 'googlePayLoaded',
  FailedToLoad = 'googlePayFailedToLoad',
  Completed = 'googlePayCompleted',
  Canceled = 'googlePayCanceled',
  Failed = 'googlePayFailed',
}
/**
 * Final result returned after presenting Google Pay.
 *
 * @since 3.2.0
 */
export type GooglePayResultInterface =
  | GooglePayEventsEnum.Completed
  | GooglePayEventsEnum.Canceled
  | GooglePayEventsEnum.Failed;
