import type {AvailabilityResponse} from '../shared';

import type {FinalizeApplePayTransactionOptions} from './enum';

export * from './enum'

export interface ApplePayDefinitions {
  isApplePayAvailable(): Promise<AvailabilityResponse>;

  payWithApplePay(options: {
    applePayOptions: ApplePayOptions;
  }): Promise<ApplePayResponse>;

  cancelApplePay(): Promise<void>;

  finalizeApplePayTransaction(
    opts: FinalizeApplePayTransactionOptions,
  ): Promise<void>;
}

export interface ApplePayResponse {
  token: string;
}

export interface ApplePayItem {
  label: string;
  amount: number | string;
}

export interface ApplePayOptions {
  merchantId: string;
  country: string;
  currency: string;
  items: ApplePayItem[];

  billingEmailAddress?: boolean;
  billingName?: boolean;
  billingPhoneNumber?: boolean;
  billingPhoneticName?: boolean;
  billingPostalAddress?: boolean;

  shippingEmailAddress?: boolean;
  shippingName?: boolean;
  shippingPhoneNumber?: boolean;
  shippingPhoneticName?: boolean;
  shippingPostalAddress?: boolean;
}


