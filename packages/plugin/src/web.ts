import { registerWebPlugin, WebPlugin } from '@capacitor/core';
import {
  AccountParams,
  ApplePayOptions,
  AvailabilityResponse,
  BankAccountTokenRequest,
  BankAccountTokenResponse,
  CardBrand,
  CardBrandResponse,
  CardTokenRequest,
  CardTokenResponse,
  CommonIntentOptions,
  ConfirmPaymentIntentOptions,
  CreatePiiTokenOptions,
  CreateSourceTokenOptions,
  FinalizeApplePayTransactionOptions,
  IdentifyCardBrandOptions,
  PaymentMethod,
  SetPublishableKeyOptions,
  StripePlugin,
  TokenResponse,
  ValidateCardNumberOptions,
  ValidateCVCOptions,
  ValidateExpiryDateOptions,
  ValidityResponse,
} from './definitions';


function formBody(json: any, prefix?: string, omit?: string[]) {
  let str = '';
  for (const prop of Object.keys(json)) {
    if (json.hasOwnProperty(prop) &&
      typeof json[prop] !== 'undefined' &&
      json[prop] !== null &&
      (!Array.isArray(omit) || !omit.includes(prop))) {
      const key = encodeURIComponent(prefix ? `${prefix}[${prop}]` : prop);
      const val = encodeURIComponent(json[prop]);

      str += `${key}=${val}&`;
    }
  }
  return str;
}

async function callStripeAPI(path: string, body: string, key: string, extraHeaders?: any) {
  extraHeaders = extraHeaders || {};

  const res = await fetch(`https://api.stripe.com${path}`, {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${key}:`)}`,
      ...extraHeaders,
    },
  });

  let parsed;

  try {
    parsed = await res.json();
  } catch (e) {
    parsed = await res.text();
  }

  if (res.ok) {
    return parsed;
  } else {
    throw parsed && parsed.error && parsed.error.message ? parsed.error.message : parsed;
  }
}

export class StripePluginWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string;

  constructor() {
    super({
      name: 'Stripe',
      platforms: ['web'],
    });
  }

  async setPublishableKey(opts: SetPublishableKeyOptions): Promise<void> {
    if (typeof opts.key !== 'string' || opts.key.trim().length === 0 || opts.key.indexOf('pk') !== 0) {
      throw new Error('you must provide a valid key');
    }

    this.publishableKey = opts.key;
  }

  async createCardToken(card: CardTokenRequest): Promise<CardTokenResponse> {
    const body = formBody(card, 'card', ['phone', 'email']);
    return callStripeAPI('/v1/tokens', body, this.publishableKey);
  }

  async createBankAccountToken(bankAccount: BankAccountTokenRequest): Promise<BankAccountTokenResponse> {
    const body = formBody(bankAccount, 'bank_account');
    return callStripeAPI('/v1/tokens', body, this.publishableKey);
  }

  async confirmPaymentIntent(opts: ConfirmPaymentIntentOptions): Promise<void> {
    if (opts.applePayOptions) {
      throw 'Apple Pay is not supported on web';
    }

    if (opts.googlePayOptions) {
      throw 'Google Pay is not supported on web';
    }

    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    return Promise.resolve();
  }

  async confirmSetupIntent(opts: CommonIntentOptions): Promise<void> {
    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    return Promise.resolve();
  }

  async payWithApplePay(options: ApplePayOptions): Promise<TokenResponse> {
    throw 'Apple Pay is not supported on web';
  }

  async cancelApplePay(): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async finalizeApplePayTransaction(opts: FinalizeApplePayTransactionOptions): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async startGooglePayTransaction(): Promise<void> {
    throw 'Google Pay is not supported on web';
  }

  async createSourceToken(opts: CreateSourceTokenOptions): Promise<TokenResponse> {
    throw 'Not implemented';
  }

  async createPiiToken(opts: CreatePiiTokenOptions): Promise<TokenResponse> {
    const body = formBody({ id_number: opts.pii }, 'pii');
    return callStripeAPI('/v1/tokens', body, this.publishableKey);
  }

  async createAccountToken(account: AccountParams): Promise<TokenResponse> {
    if (!account.legalEntity) {
      return Promise.reject('you must provide a legal entity');
    }

    switch (account.legalEntity.type) {
      case 'company':
        break;

      case 'individual':
        break;

      default:
        return Promise.reject('invalid entity type');
    }

    return;
  }

  async customizePaymentAuthUI(opts: any): Promise<void> {
    return;
  }

  async isApplePayAvailable(): Promise<AvailabilityResponse> {
    return { available: false };
  }

  async isGooglePayAvailable(): Promise<AvailabilityResponse> {
    return { available: false };
  }

  async validateCardNumber(opts: ValidateCardNumberOptions): Promise<ValidityResponse> {
    return {
      valid: opts.number.length > 0,
    };
  }

  async validateExpiryDate(opts: ValidateExpiryDateOptions): Promise<ValidityResponse> {
    let { exp_month, exp_year } = opts;

    if (exp_month < 1 || exp_month > 12) {
      return {
        valid: false,
      };
    }

    if (String(exp_year).length === 2) {
      exp_year = parseInt('20' + String(exp_year));
    }

    const currentYear = new Date().getFullYear();

    if (exp_year > currentYear) {
      return {
        valid: true,
      };
    } else if (exp_year === currentYear && exp_month >= (new Date().getMonth() + 1)) {
      return {
        valid: true,
      };
    } else {
      return {
        valid: false,
      };
    }
  }

  async validateCVC(opts: ValidateCVCOptions): Promise<ValidityResponse> {
    if (typeof opts.cvc !== 'string') {
      return { valid: false };
    }

    const len = opts.cvc.trim().length;

    return {
      valid: len > 0 && len < 4,
    };
  }

  async identifyCardBrand(opts: IdentifyCardBrandOptions): Promise<CardBrandResponse> {
    return {
      brand: CardBrand.UNKNOWN,
    };
  }

  addCustomerSource(opts: { sourceId: string; type?: string }): Promise<void> {
    return this.cs.addSrc(opts.sourceId, opts.type);
  }

  customerPaymentMethods(): Promise<{ paymentMethods: PaymentMethod[] }> {
    return this.cs.listPm();
  }

  deleteCustomerSource(opts: { sourceId: string }): Promise<void> {
    return undefined;
  }

  private cs: CustomerSession;

  async initCustomerSession(opts: { id: string; object: 'ephemeral_key'; associated_objects: Array<{ type: 'customer'; id: string }>; created: number; expires: number; livemode: boolean; secret: string }): Promise<void> {
    this.cs = new CustomerSession(opts);
  }

  setCustomerDefaultSource(opts: { sourceId: string; type?: string }): Promise<void> {
    return this.cs.setDefaultSrc(opts.sourceId, opts.type);
  }
}

class CustomerSession {
  private customerId: string;

  constructor(private key: { secret?: string, associated_objects?: any[], apiVersion?: string }) {
    if (!key.secret || !Array.isArray(key.associated_objects) || !key.associated_objects.length || !key.associated_objects[0].id) {
      throw new Error('you must provide a valid configuration');
    }

    if (!key.apiVersion) {
      throw new Error('the web implementation requires that you pass the API version used when generating this ephemeral token');
    }

    this.customerId = key.associated_objects[0].id;
  }

  async listPm(): Promise<{ paymentMethods: PaymentMethod[] }> {
    const res = await callStripeAPI('/v1/payment_methods', formBody({
      customer: this.customerId,
      type: 'card',
    }), this.key.secret, {
      'Stripe-Version': this.key.apiVersion,
    });

    return {
      paymentMethods: res.data,
    }
  }

  addSrc(id: string, type: string = 'card'): Promise<void> {
    return callStripeAPI('/v1/customers/' + this.customerId, formBody({
      source: id,
      type,
    }), this.key.secret, {
      'Stripe-Version': this.key.apiVersion,
    });
  }


  setDefaultSrc(id: string, type: string = 'card'): Promise<void> {
    return callStripeAPI('/v1/customers/' + this.customerId, formBody({
      default_source: id,
    }), this.key.secret, {
      'Stripe-Version': this.key.apiVersion,
    });
  }
}

const StripePluginInstance = new StripePluginWeb();

export { StripePluginInstance };

registerWebPlugin(StripePluginInstance);
