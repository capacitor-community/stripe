import { Stripe as _Stripe } from 'stripe';
import { CardTokenRequest, CardTokenResponse } from './definitions';
import { StripePluginWeb } from './web';


let stripeServer: _Stripe;

const apiVersion = '2020-03-02';

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

const sit = !SECRET_KEY ? it.skip : it;
const sdescribe = !SECRET_KEY ? describe.skip : describe;

if (!!SECRET_KEY) {
  stripeServer = new _Stripe(SECRET_KEY, {
    apiVersion,
  });
}

describe('Stripe Plugin', () => {

  let s: StripePluginWeb;

  beforeAll(() => {
    s = new StripePluginWeb();
  });

  describe('setPublishableKey', () => {
    it('should throw error for undefined key', async () => {
      await expect(s.setPublishableKey({ key: undefined })).rejects.toThrowError();
    });

    it('should throw error for blank key', async () => {
      await expect(s.setPublishableKey({ key: '' })).rejects.toThrowError();
    });

    it('should accept a valid key', async () => {
      const p = s.setPublishableKey({ key: PUBLISHABLE_KEY });

      await expect(p).resolves.not.toThrow();
    });
  });

  describe('createCardToken', () => {
    it('should validate card information', async () => {
      await expect(s.createCardToken({
        number: '424242424242',
      } as CardTokenRequest)).rejects.toBeDefined();

      await expect(s.createCardToken({
        number: '4242424242424242',
        exp_month: 55,
        exp_year: 2030,
        cvc: '222',
      } as CardTokenRequest)).rejects.toBeDefined();
    });

    it('should create a card token', async () => {
      const p = await s.createCardToken({
        number: '4242424242424242',
        exp_month: 5,
        exp_year: 2030,
        cvc: '222',
      });

      expect(p).toBeDefined();
      expect(p.type).toEqual('card');
      expect(p.id).toBeTruthy();
      expect(p.card).toBeTruthy();
    });
  });

  describe('createBankAccountToken', () => {
    it('should create token', async () => {
      const p = await s.createBankAccountToken({
        account_holder_name: 'John Smith',
        account_holder_type: 'individual',
        currency: 'CAD',
        country: 'CA',
        account_number: '000123456789',
        routing_number: '11000000',
      });

      expect(p).toBeDefined();
      expect(p.type).toEqual('bank_account');
      expect(p.id).toBeTruthy();
      expect(p.bank_account).toBeTruthy();
    });
  });

  xdescribe('createSourceToken', () => {
    xit('should create token');
  });

  describe('createAccountToken', () => {
    it('should create token', async () => {
      const token = await s.createAccountToken({
        legalEntity: {
          type: 'individual',
        },
        tosShownAndAccepted: true,
      });

      expect(token).toBeTruthy();
      expect(token.id).toBeTruthy();
    });
  });

  describe('createPiiToken', () => {
    it('should create token', async () => {
      const p = await s.createPiiToken({ pii: '555555555' });
      expect(p).toBeDefined();
      expect(p.type).toEqual('pii');
      expect(p.id).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('should validate card number', async () => {
      const res = await s.validateCardNumber({
        number: '4242424242424242',
      });

      expect(res).toBeTruthy();
      expect(res.valid).toBeTruthy();

      const res2 = await s.validateCardNumber({
        number: '',
      });

      expect(res2).toBeTruthy();
      expect(res2.valid).toBeFalsy();
    });

    it('should validate expiry date', async () => {
      let res = await s.validateExpiryDate({
        exp_month: 5,
        exp_year: 30,
      });

      expect(res).toBeTruthy();
      expect(res.valid).toBeTruthy();

      res = await s.validateExpiryDate({
        exp_month: 5,
        exp_year: 15,
      });

      expect(res).toBeTruthy();
      expect(res.valid).toBeFalsy();
    });

    it('should validate cvc', async () => {
      let res = await s.validateCVC({
        cvc: '442',
      });

      expect(res).toBeTruthy();
      expect(res.valid).toBeTruthy();

      res = await s.validateCVC({
        cvc: '',
      });

      expect(res).toBeTruthy();
      expect(res.valid).toBeFalsy();
    });
  });

  sdescribe('Customer Session', () => {
    let customer: _Stripe.Customer;

    beforeAll(async () => {
      customer = await stripeServer.customers.create({
        name: 'Capacitor Stripe',
        metadata: { purpose: 'Unit testing capacitor-stripe' },
      });
    });

    afterAll(async () => {
      // await stripeServer.customers.del(customer.id);
    });

    it('should create customer', () => {
      expect(customer).toBeDefined();
    });

    it('should init customer session', async () => {
      const ephKey = await stripeServer.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion },
      );

      (ephKey as any).apiVersion = apiVersion;

      await expect(s.initCustomerSession(ephKey)).resolves.not.toThrow();
      expect((s as any).cs).toBeDefined();
    });

    it('should get customer payment methods', async () => {
      const pms = await s.customerPaymentMethods();
      expect(pms).toBeDefined();
      expect(Array.isArray(pms.paymentMethods)).toBeTruthy();
    });

    describe('payment methods', () => {
      let card: CardTokenResponse;

      beforeAll(async () => {
        card = await s.createCardToken({
          number: '4242424242424242',
          cvc: '123',
          exp_year: 2030,
          exp_month: 5,
        });

        expect(card).toBeTruthy();
        expect(card.id).toBeTruthy();
        expect(card.card).toBeTruthy();
        expect(card.card.id).toBeTruthy();
      });

      it('should add new payment method to customer', async () => {
        await expect(s.addCustomerSource({
          type: 'card',
          sourceId: card.id,
        })).resolves.not.toThrow();

        const pms = await s.customerPaymentMethods();
        expect(pms).toBeDefined();
        expect(Array.isArray(pms.paymentMethods)).toBeTruthy();
        expect(pms.paymentMethods.length).toEqual(1);

        const pm = pms.paymentMethods[0];
        expect(pm).toBeTruthy();
        expect(pm.id).toEqual(card.card.id);
      });

      it('should make payment method default', async () => {
        await expect(s.setCustomerDefaultSource({
          type: 'card',
          sourceId: card.card.id,
        })).resolves.not.toThrow();

        customer = (await stripeServer.customers.retrieve(customer.id)) as unknown as _Stripe.Customer;

        expect(customer.default_source).toEqual(card.card.id);
      });
    });
  });
});
