import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  EmbeddedPaymentElementEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { EmbeddedControlsComponent } from './embedded-controls.component';

vi.mock('@capacitor-community/stripe', async (importOriginal) =>
  Object.assign({}, await importOriginal(), {
    Stripe: {
      addListener: vi.fn(),
      mountEmbeddedPaymentElement: vi.fn(),
      confirmEmbeddedPaymentElement: vi.fn(),
      unmountEmbeddedPaymentElement: vi.fn(),
    },
  }),
);

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
    .mockResolvedValueOnce({
      paymentResult: EmbeddedPaymentElementEventsEnum.Canceled,
    })
    .mockResolvedValueOnce({
      paymentResult: EmbeddedPaymentElementEventsEnum.Completed,
    });
  button.click();
  await fixture.whenStable();
  expect(button.disabled).toBe(false);
  button.click();
  await fixture.whenStable();
  expect(button.disabled).toBe(true);
  expect(
    fixture.nativeElement.querySelector('[role=status]').textContent,
  ).toContain(EmbeddedPaymentElementEventsEnum.Completed);
  await fixture.componentInstance.destroy();
  expect(remove).toHaveBeenCalledOnce();
  expect(Stripe.unmountEmbeddedPaymentElement).toHaveBeenCalledOnce();
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
  expect(Stripe.unmountEmbeddedPaymentElement).not.toHaveBeenCalled();
  expect(page.active()).toBe(false);
});

it.each([
  EmbeddedPaymentElementEventsEnum.Completed,
  EmbeddedPaymentElementEventsEnum.Canceled,
] as const)(
  'scores a success scenario against the actual %s result and releases the element',
  async (result) => {
    vi.mocked(Stripe.addListener).mockResolvedValue({ remove: vi.fn() });
    vi.mocked(Stripe.confirmEmbeddedPaymentElement).mockResolvedValue({
      paymentResult: result,
    });
    const fixture = TestBed.createComponent(EmbeddedControlsComponent);
    fixture.componentRef.setInput('scenarios', true);
    const page = fixture.componentInstance;
    const loading = page.mount(EmbeddedPaymentElementEventsEnum.Completed);
    TestBed.inject(HttpTestingController)
      .expectOne(environment.api + 'intent/without-customer')
      .flush({ paymentIntent: 'test-secret' });
    await loading;
    await page.confirm();
    expect(
      page
        .eventItems()
        .find((item) => item.name === 'confirmEmbeddedPaymentElement')?.result,
    ).toBe(result === EmbeddedPaymentElementEventsEnum.Completed);
    expect(Stripe.unmountEmbeddedPaymentElement).toHaveBeenCalledOnce();
    expect(page.active()).toBe(false);
  },
);
