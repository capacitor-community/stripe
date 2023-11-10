import type { PluginListenerHandle } from '@capacitor/core';

import type {
  IdentityVerificationSheetEventsEnum,
  IdentityVerificationSheetResultInterface,
} from './events.enum';
import type {
  CreateIdentityVerificationSheetOption,
  InitializeIdentityVerificationSheetOption,
} from './web';

export * from './events.enum';
export interface StripeIdentityPlugin {
  initialize(options: InitializeIdentityVerificationSheetOption): Promise<void>;
  create(options: CreateIdentityVerificationSheetOption): Promise<void>;
  present(): Promise<{
    identityVerificationResult: IdentityVerificationSheetResultInterface;
  }>;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Loaded,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.FailedToLoad,
    listenerFunc: (error: string) => void,
  ): PluginListenerHandle;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Completed,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Canceled,
    listenerFunc: () => void,
  ): PluginListenerHandle;

  addListener(
    eventName: IdentityVerificationSheetEventsEnum.Failed,
    listenerFunc: (error: string) => void,
  ): PluginListenerHandle;
}
