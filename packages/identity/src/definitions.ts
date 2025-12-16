import type { PluginListenerHandle } from '@capacitor/core';

import type { IdentityVerificationSheetEventsEnum, IdentityVerificationSheetResultInterface } from './events.enum';
import type { CreateIdentityVerificationSheetOption, InitializeIdentityVerificationSheetOption } from './web';

export * from './events.enum';
export interface StripeIdentityError {
  code?: string;
  message: string;
}

export interface IdentityVerificationResult {
  result: IdentityVerificationSheetResultInterface;
  error?: StripeIdentityError;
}

export interface StripeIdentityPlugin {
  initialize(options: InitializeIdentityVerificationSheetOption): Promise<void>;
  create(options: CreateIdentityVerificationSheetOption): Promise<void>;
  present(): Promise<void>;

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
}
