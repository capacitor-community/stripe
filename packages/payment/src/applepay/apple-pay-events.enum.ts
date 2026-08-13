export enum ApplePayEventsEnum {
  Loaded = 'applePayLoaded',
  FailedToLoad = 'applePayFailedToLoad',
  Completed = 'applePayCompleted',
  Canceled = 'applePayCanceled',
  Failed = 'applePayFailed',
  DidSelectShippingContact = 'applePayDidSelectShippingContact',
  DidCreatePaymentMethod = 'applePayDidCreatePaymentMethod',
}
/**
 * Final result returned after presenting Apple Pay.
 *
 * @since 3.1.0
 */
export type ApplePayResultInterface =
  | ApplePayEventsEnum.Completed
  | ApplePayEventsEnum.Canceled
  | ApplePayEventsEnum.Failed
  | ApplePayEventsEnum.DidSelectShippingContact
  | ApplePayEventsEnum.DidCreatePaymentMethod;
