import { WebPlugin } from '@capacitor/core';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import type { deprecatedIdentityVerificationResult, StripeIdentityPlugin } from './definitions';
import { IdentityVerificationSheetEventsEnum } from './definitions';

export interface InitializeIdentityVerificationSheetOption {
  publishableKey: string;
}

export interface CreateIdentityVerificationSheetOption {
  verificationId: string;
  ephemeralKeySecret: string;

  /**
   * This client secret is used only for the web platform.
   */
  clientSecret?: string;
}

export class StripeIdentityWeb extends WebPlugin implements StripeIdentityPlugin {
  private stripe: Stripe | null | undefined;
  private clientSecret: string | undefined;
  async initialize(options: InitializeIdentityVerificationSheetOption): Promise<void> {
    this.stripe = await loadStripe(options.publishableKey);
  }
  async create(options: CreateIdentityVerificationSheetOption): Promise<void> {
    this.clientSecret = options.clientSecret;
    this.notifyListeners(IdentityVerificationSheetEventsEnum.Loaded, null);
  }
  async present(): Promise<deprecatedIdentityVerificationResult> {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized.');
    }
    if (!this.clientSecret) {
      throw new Error('clientSecret is not set.');
    }
    const { error } = await this.stripe.verifyIdentity(this.clientSecret);
    if (error) {
      const { code, message } = error;
      if (code === 'session_cancelled') {
        this.notifyListeners(IdentityVerificationSheetEventsEnum.Canceled, {
          message,
        });

        this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
          result: IdentityVerificationSheetEventsEnum.Canceled,
        });
        return {
          identityVerificationResult: IdentityVerificationSheetEventsEnum.Canceled,
        };
      }
      this.notifyListeners(IdentityVerificationSheetEventsEnum.Failed, error);

      this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
        result: IdentityVerificationSheetEventsEnum.Failed,
        error,
      });
      return {
        identityVerificationResult: IdentityVerificationSheetEventsEnum.Failed,
      };
    }
    this.notifyListeners(IdentityVerificationSheetEventsEnum.Completed, null);

    this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
      result: IdentityVerificationSheetEventsEnum.Completed,
    });
    return {
      identityVerificationResult: IdentityVerificationSheetEventsEnum.Completed,
    };
  }
}
