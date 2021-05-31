import { WebPlugin } from '@capacitor/core';
import type { ConfirmCardPaymentData, Stripe } from '@stripe/stripe-js';

import type {
  AccountParams,
  ApplePayOptions,
  ApplePayResponse,
  BankAccountTokenRequest,
  BankAccountTokenResponse,
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
  GooglePayResponse,
  IdentifyCardBrandOptions,
  PresentPaymentOptionsResponse,
  SetPublishableKeyOptions,
  StripePlugin,
  TokenResponse,
  ValidateCardNumberOptions,
  ValidateCVCOptions,
  ValidateExpiryDateOptions,
  ValidityResponse,
  AvailabilityResponse,
} from './definitions';
import { CardBrand } from './definitions';

function flatten(json: any, prefix?: string, omit?: string[]): any {
  let obj: any = {};

  for (const prop of Object.keys(json)) {
    if (
      typeof json[prop] !== 'undefined' &&
      json[prop] !== null &&
      (!Array.isArray(omit) || !omit.includes(prop))
    ) {
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
    throw parsed?.error?.message ? parsed.error.message : parsed;
  }
}

async function _stripePost(
  path: string,
  body: string,
  key: string,
  extraHeaders?: any,
) {
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

export class StripeWeb extends WebPlugin implements StripePlugin {
  private publishableKey: string | undefined;
  private stripe: Stripe | undefined;

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
      scriptEl.addEventListener(
        'error',
        (ev: ErrorEvent) => {
          document.body.removeChild(scriptEl);
          reject('Failed to load Stripe JS: ' + ev.message);
        },
        { once: true },
      );

      scriptEl.addEventListener(
        'load',
        () => {
          try {
            this.stripe = new (window as any).Stripe(opts.key);
            resolve();
          } catch (err) {
            document.body.removeChild(scriptEl);
            reject(err);
          }
        },
        { once: true },
      );
    });
  }

  async createCardToken(card: CardTokenRequest): Promise<CardTokenResponse> {
    if (this.publishableKey === undefined) {
      throw 'publishableKey is undefined';
    }
    const body = formBody(card, 'card', ['phone', 'email']);
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async createBankAccountToken(
    bankAccount: BankAccountTokenRequest,
  ): Promise<BankAccountTokenResponse> {
    if (this.publishableKey === undefined) {
      throw 'publishableKey is undefined';
    }
    const body = formBody(bankAccount, 'bank_account');
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async confirmPaymentIntent(
    opts: ConfirmPaymentIntentOptions,
  ): Promise<ConfirmPaymentIntentResponse> {
    if (this.stripe === undefined) {
      throw 'Stripe is undefined';
    }

    if (opts.applePayOptions) {
      throw 'Apple Pay is not supported on web';
    }

    if (opts.googlePayOptions) {
      throw 'Google Pay is not supported on web';
    }

    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    let confirmOpts!: ConfirmCardPaymentData;

    if (opts.paymentMethodId) {
      confirmOpts = {
        payment_method: opts.paymentMethodId,
      };
    } else if (opts.card) {
      const token = await this.createCardToken(opts.card);
      confirmOpts = {
        save_payment_method: opts.saveMethod,
        setup_future_usage: opts.setupFutureUsage,
        payment_method: {
          billing_details: {
            email: opts.card.email,
            name: opts.card.name,
            phone: opts.card.phone,
            address: {
              line1: opts.card.address_line1,
              line2: opts.card.address_line2,
              city: opts.card.address_city,
              state: opts.card.address_state,
              country: opts.card.address_country,
              postal_code: opts.card.address_zip,
            },
          },
          card: {
            token: token.id,
          },
        },
      };
    }

    return this.stripe
      .confirmCardPayment(opts.clientSecret, confirmOpts)
      .then(response => response.paymentIntent || ({} as any));
  }

  async confirmSetupIntent(
    opts: ConfirmSetupIntentOptions,
  ): Promise<ConfirmSetupIntentResponse> {
    if (!opts.clientSecret) {
      return Promise.reject('you must provide a client secret');
    }

    return Promise.reject('Not supported on web');
  }

  async payWithApplePay(options: {
    applePayOptions: ApplePayOptions;
  }): Promise<ApplePayResponse> {
    console.log(options);
    throw 'Apple Pay is not supported on web';
  }

  async cancelApplePay(): Promise<void> {
    throw 'Apple Pay is not supported on web';
  }

  async finalizeApplePayTransaction(
    options: FinalizeApplePayTransactionOptions,
  ): Promise<void> {
    console.log(options);
    throw 'Apple Pay is not supported on web';
  }

  async payWithGooglePay(options: {
    googlePayOptions: GooglePayOptions;
  }): Promise<GooglePayResponse> {
    console.log(options);
    throw 'Google Pay is not supported on web';
  }

  async createSourceToken(
    options: CreateSourceTokenOptions,
  ): Promise<TokenResponse> {
    console.log(options);
    throw 'Not implemented';
  }

  async createPiiToken(options: CreatePiiTokenOptions): Promise<TokenResponse> {
    if (this.publishableKey === undefined) {
      throw 'publishableKey is undefined';
    }
    const body = formBody({ id_number: options.pii }, 'pii');
    return _stripePost('/v1/tokens', body, this.publishableKey);
  }

  async createAccountToken(account: AccountParams): Promise<TokenResponse> {
    if (this.publishableKey === undefined) {
      return Promise.reject('publishableKey is undefined');
    }
    if (!account.legalEntity) {
      return Promise.reject('you must provide a legal entity');
    }

    const body: any = {};

    if (account.legalEntity.type === 'individual') {
      body.business_type = 'individual';
      body.individual = account.legalEntity;
      body.tos_shown_and_accepted = account.tosShownAndAccepted;
    } else {
      body.business_type = 'company';
      body.company = account.legalEntity;
    }

    delete account.legalEntity.type;

    return _stripePost(
      '/v1/tokens',
      formBody({ account: body }),
      this.publishableKey,
    );
  }

  async customizePaymentAuthUI(options: any): Promise<void> {
    console.log(options);
    return;
  }

  async presentPaymentOptions(): Promise<PresentPaymentOptionsResponse> {
    return {};
  }

  async isApplePayAvailable(): Promise<AvailabilityResponse> {
    return { available: false };
  }

  async isGooglePayAvailable(): Promise<AvailabilityResponse> {
    return { available: false };
  }

  async validateCardNumber(
    opts: ValidateCardNumberOptions,
  ): Promise<ValidityResponse> {
    return {
      valid: opts.number.length > 0,
    };
  }

  async validateExpiryDate(
    opts: ValidateExpiryDateOptions,
  ): Promise<ValidityResponse> {
    const { exp_month } = opts;
    let { exp_year } = opts;

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
    } else if (
      exp_year === currentYear &&
      exp_month >= new Date().getMonth() + 1
    ) {
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

  async identifyCardBrand(
    opts: IdentifyCardBrandOptions,
  ): Promise<CardBrandResponse> {
    console.log(opts);
    return {
      brand: CardBrand.UNKNOWN,
    };
  }

  addCustomerSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse> {
    if (this.cs === undefined) {
      throw 'CustomerSession is undefined';
    }
    return this.cs.addSrc(opts.sourceId);
  }

  customerPaymentMethods(): Promise<CustomerPaymentMethodsResponse> {
    if (this.cs === undefined) {
      throw 'CustomerSession is undefined';
    }
    return this.cs.listPm();
  }

  deleteCustomerSource(opts: {
    sourceId: string;
  }): Promise<CustomerPaymentMethodsResponse> {
    console.log(opts);
    return new Promise(resolve => {
      resolve({
        paymentMethods: [],
      });
    });
  }

  private cs: CustomerSession | undefined;

  async initCustomerSession(
    opts:
      | any
      | {
          id: string;
          object: 'ephemeral_key';
          associated_objects: { type: 'customer'; id: string }[];
          created: number;
          expires: number;
          livemode: boolean;
          secret: string;
        },
  ): Promise<void> {
    this.cs = new CustomerSession(opts);
  }

  setCustomerDefaultSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse> {
    if (this.cs === undefined) {
      throw 'CustomerSession is undefined';
    }
    return this.cs.setDefaultSrc(opts.sourceId);
  }
}

class CustomerSession {
  private readonly customerId: string;

  constructor(private key: any) {
    if (
      !key.secret ||
      !Array.isArray(key.associated_objects) ||
      !key.associated_objects.length ||
      !key.associated_objects[0].id
    ) {
      throw new Error('you must provide a valid configuration');
    }

    this.customerId = key.associated_objects[0].id;
  }

  async listPm(): Promise<CustomerPaymentMethodsResponse> {
    const res = await _stripeGet(
      `/v1/customers/${this.customerId}`,
      this.key.secret,
    );

    return {
      paymentMethods: res.sources.data,
    };
  }

  async addSrc(id: string): Promise<CustomerPaymentMethodsResponse> {
    await _stripePost(
      '/v1/customers/' + this.customerId,
      formBody({
        source: id,
      }),
      this.key.secret,
    );

    return this.listPm();
  }

  async setDefaultSrc(id: string): Promise<CustomerPaymentMethodsResponse> {
    await _stripePost(
      '/v1/customers/' + this.customerId,
      formBody({
        default_source: id,
      }),
      this.key.secret,
    );

    return await this.listPm();
  }
}
