import type { PluginListenerHandle } from '@capacitor/core';

import type { CreateGooglePayOption } from '../shared';

import type { GooglePayEventsEnum, GooglePayResultInterface } from './google-pay-events.enum';

export interface GooglePayDefinitions {
  /**
   * Resolves when Google Pay is available and rejects when it is unavailable.
   * Google Pay is supported on Android and compatible web browsers, not iOS.
   */
  isGooglePayAvailable(): Promise<void>;

  /** Creates a Google Pay request. Call this before `presentGooglePay()`. */
  createGooglePay(options: CreateGooglePayOption): Promise<void>;

  /** Presents the Google Pay request created by `createGooglePay()`. */
  presentGooglePay(): Promise<{
    paymentResult: GooglePayResultInterface;
  }>;

  /** Emitted when the Google Pay request is ready to present. */
  addListener(eventName: GooglePayEventsEnum.Loaded, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when the Google Pay request could not be created. */
  addListener(
    eventName: GooglePayEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): Promise<PluginListenerHandle>;

  /** Emitted after Google Pay completes successfully. */
  addListener(eventName: GooglePayEventsEnum.Completed, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when the customer cancels Google Pay. */
  addListener(eventName: GooglePayEventsEnum.Canceled, listenerFunc: () => void): Promise<PluginListenerHandle>;

  /** Emitted when Google Pay fails. */
  addListener(eventName: GooglePayEventsEnum.Failed, listenerFunc: () => void): Promise<PluginListenerHandle>;
}
