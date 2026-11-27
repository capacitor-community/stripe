import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  EmbeddedPaymentElement,
  EmbeddedPaymentElementEventsEnum,
  Stripe,
} from '@capacitor-community/stripe';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';
import { environment } from '../../environments/environment';
import { EmbeddedControlsComponent } from './embedded-controls.component';

vi.mock('@capacitor-community/stripe', async (importOriginal) =>
  Object.assign({}, await importOriginal(), {
    EmbeddedPaymentElement: { create: vi.fn() },
    Stripe: {
      addListener: vi.fn(),
    },
  }),
);

const element = { confirm: vi.fn(), destroy: vi.fn() };

function flushIntent() {
  TestBed.inject(HttpTestingController)
    .expectOne(environment.api + 'intent/without-customer')
    .flush({ paymentIntent: 'test-secret' });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(EmbeddedPaymentElement.create).mockResolvedValue(element);
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
  flushIntent();
  await loading;
  const [[, change]] = vi.mocked(Stripe.addListener).mock.calls;
  (change as (state: { ready: boolean; height: number }) => void)({
    ready: true,
    height: 250,
  });
  await fixture.whenStable();
  expect(
    fixture.nativeElement.querySelector('ion-list > div').style.height,
  ).toBe('250px');
  const button = Array.from<HTMLElement>(
    fixture.nativeElement.querySelectorAll('ion-item'),
  ).find((item) => item.textContent.trim() === 'confirm') as HTMLIonItemElement;
  expect(button.disabled).toBe(false);
  vi.mocked(element.confirm)
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
  expect(element.destroy).toHaveBeenCalledOnce();
});

it('does not attach a late payment intent to a page that has been left', async () => {
  const page = TestBed.createComponent(
    EmbeddedControlsComponent,
  ).componentInstance;
  const loading = page.mount();
  await page.destroy();
  flushIntent();
  await loading;
  expect(EmbeddedPaymentElement.create).not.toHaveBeenCalled();
  expect(Stripe.addListener).not.toHaveBeenCalled();
});

it('releases its listener without destroying another mounted element', async () => {
  const remove = vi.fn();
  vi.mocked(Stripe.addListener).mockResolvedValue({ remove });
  vi.mocked(EmbeddedPaymentElement.create).mockRejectedValue(
    new Error('Already mounted'),
  );
  const page = TestBed.createComponent(
    EmbeddedControlsComponent,
  ).componentInstance;
  const loading = page.mount();
  flushIntent();
  await loading;
  expect(remove).toHaveBeenCalledOnce();
  expect(element.destroy).not.toHaveBeenCalled();
  expect(page.phase()).toBe('idle');
});
