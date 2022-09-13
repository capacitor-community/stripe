export enum GooglePayEventsEnum {
  Loaded = "googlePayLoaded",
  FailedToLoad = "googlePayFailedToLoad",
  Completed = "googlePayCompleted",
  Canceled = "googlePayCanceled",
  Failed = "googlePayFailed",
  DidSelectShippingContact = "didSelectShippingContact",
  DidCreatePaymentMethod = "didCreatePaymentMethod",
}
export type  GooglePayResultInterface =
  | GooglePayEventsEnum.Completed
  | GooglePayEventsEnum.Canceled
  | GooglePayEventsEnum.Failed
  | GooglePayEventsEnum.DidSelectShippingContact
  | GooglePayEventsEnum.DidCreatePaymentMethod;
