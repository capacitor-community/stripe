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
  ConfirmPaymentIntentOptions,
  ConfirmPaymentIntentResponse,
  ConfirmSetupIntentOptions,
  ConfirmSetupIntentResponse,
  CreatePiiTokenOptions,
  CreateSourceTokenOptions,
  CustomerPaymentMethodsResponse,
  FinalizeApplePayTransactionOptions,
  GooglePayOptions,
  IdentifyCardBrandOptions,
  PresentPaymentOptionsResponse,
  SetPublishableKeyOptions,
  StripePlugin,
  TokenResponse,
  ValidateCardNumberOptions,
  ValidateCVCOptions,
  ValidateExpiryDateOptions,
  ValidityResponse,
} from './definitions';


function flatten(json: any, prefix?: string, omit?: string[]): any {
  let obj: any = {};

  for (const prop of Object.keys(json)) {
    if (typeof json[prop] !== 'undefined' && json[prop] !== null && (!Array.isArray(omit) || !omit.includes(prop))) {
      if (typeof json[prop] === 'object') {
        obj = {
          ...obj,
          ...flatten(json[prop], prefix ? `${prefix}[${prop}]` : prop),
        };
      } else {
        const key = prefix ? `${prefix}[${prop}]` : prop;
        obj[key] = json[prop];
      }
    }
  }

  return obj;
}

function stringify(json: any): string {
  let str = '';
  json = flatten(json);

  for (const prop of Object.keys(json)) {
    const key = encodeURIComponent(prop);
    const val = encodeURIComponent(json[prop]);
    str += `${key}=${val}&`;
  }

  return str;
}

function formBody(json: any, prefix?: string, omit?: string[]): string {
  json = flatten(json, prefix, omit);
  return stringify(json);
}

async function _callStripeAPI(fetchUrl: string, fetchOpts: RequestInit) {
  const res = await fetch(fetchUrl, fetchOpts);

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

async function _stripePost(path: string, body: string, key: string, extraHeaders?: any) {
  extraHeaders = extraHeaders || {};

  return _callStripeAPI(`https://api.stripe.com${path}`, {
    body: body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Stripe-version': '2020-03-02',
      ...extraHeaders,
    },
  });
}

async function _stripeGet(path: string, key: string, extraHeaders?: any) {
  extraHeaders = extraHeaders || {};

  return _callStripeAPI(`https://api.stripe.com${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
      'Stripe-version': '2020-03-02',
      ...extraHeaders,
    },
  });
}

export class StripePluginWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string;
  private stripe: any;

  constructor() {
    super({
      name: 'Stripe',
      platforms: ['web'],
    });
  }

  async setPublishableKey(opts: SetPublishableKeyOptions): Promise<void> {
    if (typeof opts.key !== 'string' || opts.key.trim().length === 0) {
      throw new Error('you must provide a valid key');
    }

    const scriptEl: HTMLScriptElement = document.createElement('script');
    scriptEl.src = 'https://js.stripe.com/v3/';
    document.body.appendChild(scriptEl);
    this.publishableKey = opts.key;

    return new Promise((resolve, reject) => {
      scriptEl.addEventListener('error', (ev: ErrorEvent) => {
        document.body.removeChild(scriptEl);
        reject('Failed to load Stripe JS: ' + ev.message);
      }, { once: true });

      scriptEl.addEventListener('load', () => {
        try {
          this.stripe = new (window as any).Stripe(opts.key);
          resolve();
        } catch (err) {
          document.body.removeChild(scriptEl);
          reject(err);
        }
      }, { once: true });
    });
  }

  async createCardToken(card: CardTokenRequest): Promise<CardTokenResponse> {
    const body = formBody(card, 'card', ['phone', 'email']);
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async createBankAccountToken(bankAccount: BankAccountTokenRequest): Promise<BankAccountTokenResponse> {
    const body = formBody(bankAccount, 'bank_account');
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async confirmPaymentIntent(opts: ConfirmPaymentIntentOptions): Promise<ConfirmPaymentIntentResponse> {
    if (opts.applePayOptions) {
      throw 'Apple Pay is not supported on web';
    }

    if (opts.googlePayOptions) {
      throw 'Google Pay is not supported on web';
    }

    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    let confirmOpts;

    if (opts.paymentMethodId) {
      confirmOpts = {
        payment_method: opts.paymentMethodId,
      };
    } else if (opts.card) {
      const token = await this.createCardToken(opts.card);
      confirmOpts = {
        payment_method: {
          card: {
            token: token.id,
          },
        },
      };
    }

    return this.stripe.confirmCardPayment(opts.clientSecret, confirmOpts);
  }

  async confirmSetupIntent(opts: ConfirmSetupIntentOptions): Promise<ConfirmSetupIntentResponse> {
    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    return Promise.reject('Not supported on web');
  }

  async payWithApplePay(options: { applePayOptions: ApplePayOptions }): Promise<TokenResponse> {
    throw 'Apple Pay is not supported on web';
  }

  async cancelApplePay(): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async finalizeApplePayTransaction(opts: FinalizeApplePayTransactionOptions): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async payWithGooglePay(opts: { googlePayOptions: GooglePayOptions }): Promise<void> {
    throw 'Google Pay is not supported on web';
  }

  async createSourceToken(opts: CreateSourceTokenOptions): Promise<TokenResponse> {
    throw 'Not implemented';
  }

  async createPiiToken(opts: CreatePiiTokenOptions): Promise<TokenResponse> {
    const body = formBody({ id_number: opts.pii }, 'pii');
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async createAccountToken(account: AccountParams): Promise<TokenResponse> {
    if (!account.legalEntity) {
      return Promise.reject('you must provide a legal entity');
    }

    let body: any = {};

    if (account.legalEntity.type === 'individual') {
      body.business_type = 'individual';
      body.individual = account.legalEntity;
      body.tos_shown_and_accepted = account.tosShownAndAccepted;
    } else {
      body.business_type = 'company';
      body.company = account.legalEntity;
    }

    delete account.legalEntity.type;

    return _stripePost('/v1/tokens', formBody({ account: body }), this.publishableKey);
  }

  async customizePaymentAuthUI(opts: any): Promise<void> {
    return;
  }

  async presentPaymentOptions(): Promise<PresentPaymentOptionsResponse> {
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

  addCustomerSource(opts: { sourceId: string; type?: string }): Promise<CustomerPaymentMethodsResponse> {
    return this.cs.addSrc(opts.sourceId);
  }

  customerPaymentMethods(): Promise<CustomerPaymentMethodsResponse> {
    return this.cs.listPm();
  }

  deleteCustomerSource(opts: { sourceId: string }): Promise<CustomerPaymentMethodsResponse> {
    return undefined;
  }

  private cs: CustomerSession;

  async initCustomerSession(opts: any | { id: string; object: 'ephemeral_key'; associated_objects: Array<{ type: 'customer'; id: string }>; created: number; expires: number; livemode: boolean; secret: string }): Promise<void> {
    this.cs = new CustomerSession(opts);
  }

  setCustomerDefaultSource(opts: { sourceId: string; type?: string }): Promise<CustomerPaymentMethodsResponse> {
    return this.cs.setDefaultSrc(opts.sourceId);
  }
}

class CustomerSession {
  private readonly customerId: string;

  constructor(private key: any) {
    if (!key.secret || !Array.isArray(key.associated_objects) || !key.associated_objects.length || !key.associated_objects[0].id) {
      throw new Error('you must provide a valid configuration');
    }

    this.customerId = key.associated_objects[0].id;
  }

  async listPm(): Promise<CustomerPaymentMethodsResponse> {
    const res = await _stripeGet(`/v1/customers/${this.customerId}`, this.key.secret);

    return {
      paymentMethods: res.sources.data,
    };
  }

  async addSrc(id: string): Promise<CustomerPaymentMethodsResponse> {
    await _stripePost('/v1/customers/' + this.customerId, formBody({
      source: id,
    }), this.key.secret);

    return this.listPm();
  }


  async setDefaultSrc(id: string): Promise<CustomerPaymentMethodsResponse> {
    await _stripePost('/v1/customers/' + this.customerId, formBody({
      default_source: id,
    }), this.key.secret);

    return await this.listPm();
  }
}

const StripePluginInstance = new StripePluginWeb();

export { StripePluginInstance };

registerWebPlugin(StripePluginInstance);
