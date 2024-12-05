import type { PluginListenerHandle } from '@capacitor/core';

import type { IdentityVerificationSheetEventsEnum, IdentityVerificationSheetResultInterface } from './events.enum';
import type { CreateIdentityVerificationSheetOption, InitializeIdentityVerificationSheetOption } from './web';

export * from './events.enum';
export interface StripeIdentityError {
  message: string;
}
export interface StripeIdentityPlugin {
  initialize(options: InitializeIdentityVerificationSheetOption): Promise<void>;
  create(options: CreateIdentityVerificationSheetOption): Promise<void>;
  present(): Promise<{
    identityVerificationResult: IdentityVerificationSheetResultInterface;
  }>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Loaded,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.FailedToLoad,
    listenerFunc: (info: StripeIdentityError) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Completed,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Canceled,
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Failed,
    listenerFunc: (info: StripeIdentityError) => void,
  ): Promise<PluginListenerHandle>;
}
