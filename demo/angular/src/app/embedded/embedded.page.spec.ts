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
import { EmbeddedControlsComponent } from './embedded-controls.component';

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
  vi.mocked(Stripe.mountEmbeddedPaymentElement).mockResolvedValue();
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
  const fixture = TestBed.createComponent(EmbeddedControlsComponent);
  const loading = fixture.componentInstance.mount();
  const request = TestBed.inject(HttpTestingController).expectOne(
    environment.api + 'intent/without-customer',
  );
  request.flush({ paymentIntent: 'test-secret' });
  await loading;
  const [[, change]] = vi.mocked(Stripe.addListener).mock.calls;
  (change as (state: { ready: boolean; height: number }) => void)({
    ready: true,
    height: 250,
  });
  await fixture.whenStable();
  expect(
    fixture.nativeElement.querySelector('#embedded-demo').style.height,
  ).toBe('250px');
  const button = Array.from<HTMLElement>(
    fixture.nativeElement.querySelectorAll('ion-item'),
  ).find((item) => item.textContent.trim() === 'confirm') as HTMLIonItemElement;
  expect(button.disabled).toBe(false);
  vi.mocked(Stripe.confirmEmbeddedPaymentElement)
    .mockResolvedValueOnce({ result: 'canceled' })
    .mockResolvedValueOnce({ result: 'completed' });
  button.click();
  await fixture.whenStable();
  expect(button.disabled).toBe(false);
  button.click();
  await fixture.whenStable();
  expect(button.disabled).toBe(true);
  expect(
    fixture.nativeElement.querySelector('[role=status]').textContent,
  ).toContain('completed');
  await fixture.componentInstance.destroy();
  expect(remove).toHaveBeenCalledOnce();
  expect(Stripe.destroyEmbeddedPaymentElement).toHaveBeenCalledOnce();
});

it('does not attach a late payment intent to a page that has been left', async () => {
  const page = TestBed.createComponent(
    EmbeddedControlsComponent,
  ).componentInstance;
  const loading = page.mount();
  await page.destroy();
  TestBed.inject(HttpTestingController)
    .expectOne(environment.api + 'intent/without-customer')
    .flush({ paymentIntent: 'test-secret' });
  await loading;
  expect(Stripe.mountEmbeddedPaymentElement).not.toHaveBeenCalled();
  expect(Stripe.addListener).not.toHaveBeenCalled();
});

it('releases its listener without destroying another mounted element', async () => {
  const remove = vi.fn();
  vi.mocked(Stripe.addListener).mockResolvedValue({ remove });
  vi.mocked(Stripe.mountEmbeddedPaymentElement).mockRejectedValue(
    new Error('Already mounted'),
  );
  const page = TestBed.createComponent(
    EmbeddedControlsComponent,
  ).componentInstance;
  const loading = page.mount();
  TestBed.inject(HttpTestingController)
    .expectOne(environment.api + 'intent/without-customer')
    .flush({ paymentIntent: 'test-secret' });
  await loading;
  expect(remove).toHaveBeenCalledOnce();
  expect(Stripe.destroyEmbeddedPaymentElement).not.toHaveBeenCalled();
  expect(page.active()).toBe(false);
});

it.each(['completed', 'canceled'] as const)(
  'scores a success scenario against the actual %s result and releases the element',
  async (result) => {
    vi.mocked(Stripe.addListener).mockResolvedValue({ remove: vi.fn() });
    vi.mocked(Stripe.confirmEmbeddedPaymentElement).mockResolvedValue({
      result,
    });
    const fixture = TestBed.createComponent(EmbeddedControlsComponent);
    fixture.componentRef.setInput('scenarios', true);
    const page = fixture.componentInstance;
    const loading = page.mount('completed');
    TestBed.inject(HttpTestingController)
      .expectOne(environment.api + 'intent/without-customer')
      .flush({ paymentIntent: 'test-secret' });
    await loading;
    await page.confirm();
    expect(
      page
        .eventItems()
        .find((item) => item.name === 'confirmEmbeddedPaymentElement')?.result,
    ).toBe(result === 'completed');
    expect(Stripe.destroyEmbeddedPaymentElement).toHaveBeenCalledOnce();
    expect(page.active()).toBe(false);
  },
);
