import type { PluginListenerHandle } from '@capacitor/core';

import type { IdentityVerificationSheetEventsEnum, IdentityVerificationSheetResultInterface } from './events.enum';
import type { CreateIdentityVerificationSheetOption, InitializeIdentityVerificationSheetOption } from './web';

export * from './events.enum';
export interface StripeIdentityError {
  code?: string;
  message: string;
}

/**
 * @deprecated
 * `identityVerificationResult` is deprecated and will be removed in the next major version (v8).
 *
 *
 * This property relies on a PluginCall that cannot be persisted reliably across Android lifecycle events.
 * Due to limitations in the Capacitor plugin system, the saved call is lost when the activity is destroyed
 * (e.g., due to backgrounding, rotation, or process death).
 * To avoid inconsistent behavior and potential crashes, please migrate to a stateless design where any necessary data
 * is persisted explicitly and reprocessed on app resume or reload.
 */
export interface deprecatedIdentityVerificationResult {
  identityVerificationResult: IdentityVerificationSheetResultInterface;
}

export interface IdentityVerificationResult {
  result: IdentityVerificationSheetResultInterface;
  error?: StripeIdentityError;
}

export interface StripeIdentityPlugin {
  initialize(options: InitializeIdentityVerificationSheetOption): Promise<void>;
  create(options: CreateIdentityVerificationSheetOption): Promise<void>;
  present(): Promise<deprecatedIdentityVerificationResult>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Loaded,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.FailedToLoad,
    listenerFunc: (info: StripeIdentityError) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.VerificationResult,
    listenerFunc: (result: IdentityVerificationResult) => void,
  ): Promise<PluginListenerHandle>;

  /**
   * @deprecated
   * Listening to verification results via `present()` is deprecated.
   *
   * Please use `addListener(IdentityVerificationSheetEventsEnum.VerificationResult, listener)` instead.
   * This new event-based approach provides better reliability across app lifecycle events such as backgrounding,
   * rotation, and process restarts.
   */
  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Completed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * @deprecated
   * Listening to verification results via `present()` is deprecated.
   *
   * Please use `addListener(IdentityVerificationSheetEventsEnum.VerificationResult, listener)` instead.
   * This new event-based approach provides better reliability across app lifecycle events such as backgrounding,
   * rotation, and process restarts.
   */
  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  /**
   * @deprecated
   * Listening to verification results via `present()` is deprecated.
   *
   * Please use `addListener(IdentityVerificationSheetEventsEnum.VerificationResult, listener)` instead.
   * This new event-based approach provides better reliability across app lifecycle events such as backgrounding,
   * rotation, and process restarts.
   */
  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Failed,
    listenerFunc: (info: StripeIdentityError) => void,
  ): Promise<PluginListenerHandle>;
}
