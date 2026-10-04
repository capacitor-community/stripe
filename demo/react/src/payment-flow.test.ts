import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { StripeWeb } from '@capacitor-community/stripe/dist/esm/web.js';
import { PaymentFlowEventsEnum } from '@capacitor-community/stripe';

// Stub only the external Stencil UI and Stripe SDK; exercise the public plugin methods.
class Sheet extends HTMLElement {
  openModal = vi.fn();
  closeModal = vi.fn();
  async componentOnReady() { return this; }
}

class CardModal extends HTMLElement {
  shouldUseDefaultFormSubmitAction = true;
  updateProgress = vi.fn();
  submit!: (event: CustomEvent) => void;
  connectedCallback() { this.appendChild(document.createElement('stripe-modal')); }
  async componentOnReady() { return this; }
  present() { return new Promise<CustomEvent>((resolve) => { this.submit = resolve; }); }
}

customElements.define('stripe-modal', Sheet);
customElements.define('stripe-card-element-modal', CardModal);
beforeEach(() => vi.stubGlobal('matchMedia', () => ({ matches: false })));
afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

test.each(['payment', 'setup', 'declined'] as const)(
  'PaymentFlow defers %s confirmation and reports the Stripe result',
  async (scenario) => {
    const stripe = {
      createToken: vi.fn().mockResolvedValue({ token: { card: { last4: '4242' } } }),
      confirmCardPayment: vi.fn().mockResolvedValue(
        scenario === 'declined' ? { error: { message: 'declined' } } : { paymentIntent: { status: 'succeeded' } },
      ),
      confirmCardSetup: vi.fn().mockResolvedValue({ setupIntent: { status: 'succeeded' } }),
    };
    const plugin = new StripeWeb();
    const completed = vi.fn();
    const failed = vi.fn();
    await plugin.addListener(PaymentFlowEventsEnum.Completed, completed);
    await plugin.addListener(PaymentFlowEventsEnum.Failed, failed);
    await plugin.initialize({ publishableKey: 'pk_test_example' });
    await plugin.createPaymentFlow({
      merchantDisplayName: 'Test',
      ...(scenario === 'setup' ? { setupIntentClientSecret: 'seti_test_secret' } : { paymentIntentClientSecret: 'pi_test_secret' }),
    });
    const modal = document.querySelector('stripe-card-element-modal') as CardModal;
    const sheet = modal.querySelector('stripe-modal') as Sheet;
    expect(modal.shouldUseDefaultFormSubmitAction).toBe(false);
    const presentation = plugin.presentPaymentFlow();
    await vi.waitFor(() => expect(sheet.openModal).toHaveBeenCalledOnce());
    const cardNumberElement = {};
    modal.submit(new CustomEvent('formSubmit', { detail: { stripe, cardNumberElement } }));
    await expect(presentation).resolves.toEqual({ cardNumber: '4242' });
    expect(modal.updateProgress).toHaveBeenCalledWith('');
    expect(sheet.closeModal).toHaveBeenCalledOnce();
    expect(stripe.confirmCardPayment).not.toHaveBeenCalled();
    expect(stripe.confirmCardSetup).not.toHaveBeenCalled();

    const expected = scenario === 'declined' ? PaymentFlowEventsEnum.Failed : PaymentFlowEventsEnum.Completed;
    await expect(plugin.confirmPaymentFlow()).resolves.toEqual({ paymentResult: expected });
    const confirm = scenario === 'setup' ? stripe.confirmCardSetup : stripe.confirmCardPayment;
    expect(confirm).toHaveBeenCalledExactlyOnceWith(
      scenario === 'setup' ? 'seti_test_secret' : 'pi_test_secret',
      { payment_method: { card: cardNumberElement } },
    );
    expect(completed).toHaveBeenCalledTimes(scenario === 'declined' ? 0 : 1);
    expect(failed).toHaveBeenCalledTimes(scenario === 'declined' ? 1 : 0);
  },
);
