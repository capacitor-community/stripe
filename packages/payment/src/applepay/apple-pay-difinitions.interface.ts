import type { PluginListenerHandle } from '@capacitor/core';

import type {
  CreateApplePayOption,
  DidCreatePaymentMethod,
  DidSelectShippingContact,
  UpdateApplePaySheetOption,
} from '../shared';

import type { ApplePayEventsEnum, ApplePayResultInterface } from './apple-pay-events.enum';

export interface ApplePayDefinitions {
  /**
   * Resolves when Apple Pay is available and rejects when it is unavailable.
   * Apple Pay is supported on iOS and compatible web browsers, not Android.
   *
   * @since 3.1.0
   */
  isApplePayAvailable(): Promise<void>;

  /**
   * Creates an Apple Pay request. Call this before `presentApplePay()`.
   *
   * @since 3.1.0
   */
  createApplePay(options: CreateApplePayOption): Promise<void>;

  /**
   * Presents the Apple Pay request created by `createApplePay()`.
   *
   * @since 3.1.0
   */
  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }>;

  /**
   * Updates the native Apple Pay sheet after a shipping-contact callback.
   * iOS only; this method is not supported on web.
   *
   * @since 8.2.0
   */
  updateApplePaySheet(options: UpdateApplePaySheetOption): Promise<void>;

  /**
   * Emitted when the Apple Pay request is ready to present.
   *
   * @since 3.1.0
   */
  addListener(eventName: ApplePayEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the Apple Pay request could not be created.
   *
   * @since 3.1.0
   */
  addListener(
    eventName: ApplePayEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * Emitted after Apple Pay completes successfully.
   *
   * @since 3.1.0
   */
  addListener(eventName: ApplePayEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when the customer cancels Apple Pay.
   *
   * @since 3.1.0
   */
  addListener(eventName: ApplePayEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /**
   * Emitted when Apple Pay fails.
   *
   * @since 3.1.0
   */
  addListener(
    eventName: ApplePayEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * iOS only. Emitted when the customer selects a shipping contact. Use the
   * supplied `updateId` with `updateApplePaySheet()`.
   *
   * @since 4.1.0
   */
  addListener(
    eventName: ApplePayEventsEnum.DidSelectShippingContact,
    listenerFunc: (data: DidSelectShippingContact) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * iOS only. Emitted after Apple Pay creates its Stripe PaymentMethod.
   *
   * @since 4.1.0
   */
  addListener(
    eventName: ApplePayEventsEnum.DidCreatePaymentMethod,
    listenerFunc: (data: DidCreatePaymentMethod) => void,
  ): Promise<PluginListenerHandle>;
}
