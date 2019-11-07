import { CardTokenRequest } from './definitions';
import { StripePluginWeb } from './web';


const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

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

    it('should throw error for invalid key', async () => {
      await expect(s.setPublishableKey({ key: 'notavalidkey' })).rejects.toThrowError();
    });

    it('should accept a valid key', async () => {
      await expect(s.setPublishableKey({ key: PUBLISHABLE_KEY })).resolves.not.toThrow();
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

  describe('createPiiToken', () => {
    it('should create token', async () => {
      const p = await s.createPiiToken({ pii: '555555555' });
      expect(p).toBeDefined();
      expect(p.type).toEqual('pii');
      expect(p.id).toBeTruthy();
    });
  });
});
