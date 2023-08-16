import type { PluginListenerHandle } from '@capacitor/core';

import type {IdentityVerificationSheetEventsEnum, IdentityVerificationSheetResultInterface} from './identity-verification-sheet-events.enum';

export interface CreateIdentityVerificationSheetOption {
  verificationId: string; 
  ephemeralKeySecret: string;
}


export interface IdentityVerificationSheetDefinitions {
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
