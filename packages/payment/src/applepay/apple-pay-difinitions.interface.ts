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
   */
  isApplePayAvailable(): Promise<void>;

  /** Creates an Apple Pay request. Call this before `presentApplePay()`. */
  createApplePay(options: CreateApplePayOption): Promise<void>;

  /** Presents the Apple Pay request created by `createApplePay()`. */
  presentApplePay(): Promise<{
    paymentResult: ApplePayResultInterface;
  }>;

  /**
   * Updates the native Apple Pay sheet after a shipping-contact callback.
   * iOS only; this method is not supported on web.
   */
  updateApplePaySheet(options: UpdateApplePaySheetOption): Promise<void>;

  /** Emitted when the Apple Pay request is ready to present. */
  addListener(eventName: ApplePayEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when the Apple Pay request could not be created. */
  addListener(
    eventName: ApplePayEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted after Apple Pay completes successfully. */
  addListener(eventName: ApplePayEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when the customer cancels Apple Pay. */
  addListener(eventName: ApplePayEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when Apple Pay fails. */
  addListener(
    eventName: ApplePayEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * iOS only. Emitted when the customer selects a shipping contact. Use the
   * supplied `updateId` with `updateApplePaySheet()`.
   */
  addListener(
    eventName: ApplePayEventsEnum.DidSelectShippingContact,
    listenerFunc: (data: DidSelectShippingContact) => void,
  ): Promise<PluginListenerHandle>;

  /** iOS only. Emitted after Apple Pay creates its Stripe PaymentMethod. */
  addListener(
    eventName: ApplePayEventsEnum.DidCreatePaymentMethod,
    listenerFunc: (data: DidCreatePaymentMethod) => void,
  ): Promise<PluginListenerHandle>;
}
