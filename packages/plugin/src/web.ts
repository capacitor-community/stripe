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
  SetPublishableKeyOptions,
  StripePluginPlugin,
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

async function callStripeAPI(path: string, body: string, key: string) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${btoa(`${key}:`)}`,
    },
    mode: 'no-cors',
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

export class StripePluginWeb extends WebPlugin implements StripePluginPlugin {
  private publishableKey: string;

  constructor() {
    super({
      name: 'StripePlugin',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
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
}

const StripePlugin = new StripePluginWeb();

export { StripePlugin };


registerWebPlugin(StripePlugin);
