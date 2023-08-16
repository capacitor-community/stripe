import { WebPlugin} from '@capacitor/core';

import type { StripeIdentityPlugin } from './definitions';
import type {IdentityVerificationSheetResultInterface} from './events.enum';

export interface CreateIdentityVerificationSheetOption {
  verificationId: string;
  ephemeralKeySecret: string;
}

export class StripeIdentityWeb
  extends WebPlugin
  implements StripeIdentityPlugin
{
  async createIdentityVerificationSheet(_options: CreateIdentityVerificationSheetOption): Promise<void> {
    console.log(_options);
    throw new Error('Method not implemented.');
  }

  presentIdentityVerificationSheet(): Promise<{
    identityVerificationResult: IdentityVerificationSheetResultInterface;
  }> {
    throw new Error('Method not implemented.');
  }
}
