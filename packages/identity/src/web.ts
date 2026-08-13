import { WebPlugin } from '@capacitor/core';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import type { StripeIdentityPlugin } from './definitions';
import { IdentityVerificationSheetEventsEnum } from './definitions';

export interface InitializeIdentityVerificationSheetOption {
  /**
   * Stripe publishable key used by the web Identity SDK. Native platforms
   * accept this option for API parity but initialize Identity from the
   * verification session credentials supplied to `create()`.
   */
  publishableKey: string;
}

export interface CreateIdentityVerificationSheetOption {
  /**
   * ID of the VerificationSession created by your server. Required on iOS and
   * Android.
   */
  verificationId: string;
  /**
   * Ephemeral-key secret scoped to the VerificationSession. Required on iOS
   * and Android and must be returned by your server.
   */
  ephemeralKeySecret: string;

  /**
   * Client secret of the VerificationSession. Required on web and ignored by
   * the native Identity SDKs.
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
  async present(): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized.');
    }
    if (!this.clientSecret) {
      throw new Error('clientSecret is not set.');
    }
    const { error } = await this.stripe.verifyIdentity(this.clientSecret);
    if (error) {
      const { code } = error;
      if (code === 'session_cancelled') {
        this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
          result: IdentityVerificationSheetEventsEnum.Canceled,
        });
        return;
      }
      this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
        result: IdentityVerificationSheetEventsEnum.Failed,
        error,
      });
      return;
    }
    this.notifyListeners(IdentityVerificationSheetEventsEnum.VerificationResult, {
      result: IdentityVerificationSheetEventsEnum.Completed,
    });
  }
}
