import type {PluginListenerHandle} from '@capacitor/core';

import type {IdentityVerificationSheetEventsEnum, IdentityVerificationSheetResultInterface} from './events.enum';
import type {CreateIdentityVerificationSheetOption} from './web';

export * from './events.enum';
export interface StripeIdentityPlugin {
  createIdentityVerificationSheet(options: CreateIdentityVerificationSheetOption): Promise<void>;
  presentIdentityVerificationSheet(): Promise<{
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
