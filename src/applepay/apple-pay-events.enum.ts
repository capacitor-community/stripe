export enum ApplePayEventsEnum {
  Loaded = "applePayLoaded",
  FailedToLoad = "applePayFailedToLoad",
  Completed = "applePayCompleted",
  Canceled = "applePayCanceled",
  Failed = "applePayFailed",
  DidSelectShippingContact = "didSelectShippingContact",
  DidCreatePaymentMethod = "didCreatePaymentMethod",
}
export type  ApplePayResultInterface =
  | ApplePayEventsEnum.Completed
  | ApplePayEventsEnum.Canceled
  | ApplePayEventsEnum.Failed
  | ApplePayEventsEnum.DidSelectShippingContact
  | ApplePayEventsEnum.DidCreatePaymentMethod;
