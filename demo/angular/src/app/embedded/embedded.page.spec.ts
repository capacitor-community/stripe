import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Stripe } from '@capacitor-community/stripe';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { EmbeddedPage } from './embedded.page';

vi.mock('@capacitor-community/stripe', () => ({
  Stripe: {
    addListener: vi.fn(),
    mountEmbeddedPaymentElement: vi.fn(),
    confirmEmbeddedPaymentElement: vi.fn(),
    destroyEmbeddedPaymentElement: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideIonicAngular(),
    ],
  });
});

it('allows retry after a canceled confirmation and disables payment after success', async () => {
  const remove = vi.fn();
  vi.mocked(Stripe.addListener).mockResolvedValue({ remove });
  const fixture = TestBed.createComponent(EmbeddedPage);
  const loading = fixture.componentInstance.ionViewDidEnter();
  const request = TestBed.inject(HttpTestingController).expectOne(
    environment.api + 'intent/without-customer',
  );
  expect(request.request.body).toEqual({ amount: 1099, currency: 'usd' });
  request.flush({ paymentIntent: 'test-secret' });
  await loading;
  const [[, change]] = vi.mocked(Stripe.addListener).mock.calls;
  (change as (state: { ready: boolean; height: number }) => void)({
    ready: true,
    height: 250,
  });
  await fixture.whenStable();
  expect(
    fixture.nativeElement.querySelector('#embedded-payment-methods').style
      .height,
  ).toBe('250px');
  const button = fixture.nativeElement.querySelector(
    'ion-button[type="submit"]',
  );
  expect(button.disabled).toBe(false);
  vi.mocked(Stripe.confirmEmbeddedPaymentElement)
    .mockResolvedValueOnce({ result: 'canceled' })
    .mockResolvedValueOnce({ result: 'completed' });
  const form = fixture.nativeElement.querySelector('form');
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await fixture.whenStable();
  expect(button.disabled).toBe(false);
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await fixture.whenStable();
  expect(button.disabled).toBe(true);
  expect(
    fixture.nativeElement.querySelector('[role=status]').textContent,
  ).toContain('completed');
  await fixture.componentInstance.ionViewWillLeave();
  expect(remove).toHaveBeenCalledOnce();
  expect(Stripe.destroyEmbeddedPaymentElement).toHaveBeenCalledOnce();
});

it('does not attach a late payment intent to a page that has been left', async () => {
  const page = TestBed.createComponent(EmbeddedPage).componentInstance;
  const loading = page.ionViewDidEnter();
  await page.ionViewWillLeave();
  TestBed.inject(HttpTestingController)
    .expectOne(environment.api + 'intent/without-customer')
    .flush({ paymentIntent: 'test-secret' });
  await loading;
  expect(Stripe.mountEmbeddedPaymentElement).not.toHaveBeenCalled();
  expect(Stripe.addListener).not.toHaveBeenCalled();
});
