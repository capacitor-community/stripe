const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const browser = browser || chrome

describe('Init', () => {
  beforeAll(async () => {
    await browser.waitUntil(async () => {
      if (!!$('app-root')) {
        await browser.pause(1000);
        return true;
      }
      return false;
    });
  });

  afterAll(() => {
    // set helper
    browser.execute(() => {
      window.Stripe = Capacitor.Plugins.StripePlugin;
    });

    browser.setTimeout({
      script: 5000,
    });
  });

  it('should load', () => {
    expect($('app-root')).toBeTruthy();
  });

  it('should display header', () => {
    const headerEl = $('app-root').$('ion-header');
    expect(headerEl).toBeTruthy();
    const titleEl = headerEl.$('ion-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.getText()).toContain('Stripe test');
  });

  it('Capacitor should be defined', () => {
    const res = browser.execute(() => typeof Capacitor !== 'undefined');
    expect(res).toBeTruthy();
  });

  it('Capacitor.Plugins should be defined', () => {
    const res = browser.execute(() => typeof Capacitor.Plugins !== 'undefined');
    expect(res).toBeTruthy();
  });

  it('Capacitor.Plugins.StripePlugin should be defined', () => {
    const res = browser.execute(() => typeof Capacitor.Plugins.StripePlugin !== 'undefined');
    expect(res).toBeTruthy();
  });
});

describe('publishable key', () => {
  it('setPublishableKey should be defined', () => {
    expect(browser.execute(() => typeof Stripe.setPublishableKey === 'function')).toBeTruthy();
  });

  const noKey = [
    ['validateCardNumber', { number: '4242424242424242' }],
    ['validateExpiryDate', { exp_month: 5, exp_year: 2030 }],
    ['identifyCardBrand', { number: '4242424242424242' }],
  ];

  const key = [
    ['createCardToken', { number: '4242424242424242', exp_month: 5, exp_year: 2030, cvc: '444' }],
  ];

  for (const i of noKey) {
    const [method, opts] = i;
    it(`should allow calling ${method} without setting key`, () => {
      expect(
        browser.executeAsync((method, opts, done) => Stripe[method].apply(Stripe, opts).then(() => done(true)).catch(() => done(false)), method, opts),
      ).toBeTruthy();
    });
  }

  for (const i of key) {
    const [method, opts] = i;
    it(`should throw error if ${method} was called without setting key`, () => {
      expect(
        browser.executeAsync((method, opts, done) => Stripe[method].apply(Stripe, opts).then(() => done(true)).catch(() => done(false)), method, opts),
      ).toBeFalsy();
    });
  }

  it('should throw error if key is missing or empty', () => {
    expect(
      browser.executeAsync((done) => Stripe.setPublishableKey({}).then(() => done(true)).catch(() => done(false))),
    ).toBeFalsy();

    expect(
      browser.executeAsync((done) => Stripe.setPublishableKey({ key: '' }).then(() => done(true)).catch(() => done(false))),
    ).toBeFalsy();
  });

  it('should accept a valid key', () => {
    expect(
      browser.executeAsync((key, done) => Stripe.setPublishableKey({ key }).then(() => done(true)).catch(() => done(false)), PUBLISHABLE_KEY),
    ).toBeTruthy();
  });
});

describe('createCardToken', () => {
  it('should create card token', () => {
    const res = browser.executeAsync((done) =>
        Stripe.createCardToken({
          number: '4242424242424242',
          exp_month: 5,
          exp_year: 2030,
          cvc: '444'
        })
          .then((res) => done({ success: true, res }))
          .catch(err => done({ success: false, err }))
    );

    expect(res).toBeTruthy();
    expect(res.success).toBeTruthy();
    expect(res.res).toBeDefined();
    expect(res.res.card).toBeDefined();
    expect(res.res.card.last4).toEqual('4242');
    expect(res.res.id).toBeTruthy();
    expect(res.res.type).toEqual('card');
  });
});

describe('createBankAccountToken', () => {
  it('should create bank account token', () => {
    const res = browser.executeAsync((done) =>
      Stripe.createBankAccountToken({
        account_holder_name: 'John Smith',
        account_holder_type: 'individual',
        currency: 'CAD',
        country: 'CA',
        account_number: '000123456789',
        routing_number: '11000000',
      })
        .then((res) => done({ success: true, res }))
        .catch(err => done({ success: false, err }))
    );

    expect(res).toBeTruthy();
    expect(res.success).toBeTruthy();
    expect(res.res).toBeDefined();
    expect(res.res.bankAccount).toBeDefined();
    expect(res.res.bankAccount.last4).toEqual('6789');
    expect(res.res.id).toBeTruthy();
    expect(res.res.type).toEqual('bank_account');
  });
});

describe('createPiiToken', () => {
  it('should create PII token', () => {
    const res = browser.executeAsync((done) =>
      Stripe.createPiiToken({pii: '555555555'})
        .then((res) => done({ success: true, res }))
        .catch(err => done({ success: false, err })),
    );

    console.log(res);

    expect(res).toBeTruthy();
    expect(res.success).toBeTruthy();
    expect(res.res).toBeDefined();
    expect(res.res.id).toBeTruthy();
  });
});
