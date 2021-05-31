export * from './enum'

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
