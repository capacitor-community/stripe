export enum ApplePayEventsEnum {
  Loaded = "applePayLoaded",
  FailedToLoad = "applePayFailedToLoad",
  Completed = "applePayCompleted",
  Canceled = "applePayCanceled",
  Failed = "applePayFailed",
  DidSelectShippingContact = "applePayDidSelectShippingContact",
  DidCreatePaymentMethod = "applePayDidCreatePaymentMethod",
}
export type  ApplePayResultInterface =
  | ApplePayEventsEnum.Completed
  | ApplePayEventsEnum.Canceled
  | ApplePayEventsEnum.Failed
  | ApplePayEventsEnum.DidSelectShippingContact
  | ApplePayEventsEnum.DidCreatePaymentMethod;
