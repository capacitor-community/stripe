import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PaymentFlowEventsEnum } from '@capacitor-community/stripe';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';
import { DemoPage } from './demo/demo.page';
import { HelperService } from './shared/helper.service';
import { SheetPage } from './sheet/sheet.page';

const listeners = vi.hoisted(() => new Map<string, () => void>());
vi.mock('@capacitor-community/stripe', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@capacitor-community/stripe')>()),
  Stripe: {
    addListener: vi.fn(async (name: string, callback: () => void) => {
      listeners.set(name, callback);
      return { remove: vi.fn() };
    }),
    isApplePayAvailable: vi.fn().mockResolvedValue(undefined),
    isGooglePayAvailable: vi.fn().mockResolvedValue(undefined),
  },
}));

beforeEach(() => {
  listeners.clear();
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHttpClient(),
      provideIonicAngular(),
    ],
  });
});

it('updates demo actions after asynchronous plugin events without manual change detection', async () => {
  const fixture = TestBed.createComponent(DemoPage);
  await fixture.whenStable();
  const flow = [...fixture.nativeElement.querySelectorAll('ion-list')].find(
    (list) =>
      list.querySelector('ion-list-header')?.textContent.trim() ===
      'PaymentFlow',
  );
  const actions = flow.querySelectorAll('ion-item');
  expect([...actions].map((item) => item.disabled)).toEqual([
    false,
    true,
    true,
  ]);

  for (const [event, disabled] of [
    [PaymentFlowEventsEnum.Loaded, [true, false, true]],
    [PaymentFlowEventsEnum.Created, [true, true, false]],
    [PaymentFlowEventsEnum.Completed, [false, true, true]],
  ] as const) {
    listeners.get(event)!();
    await fixture.whenStable();
    expect([...actions].map((item) => item.disabled)).toEqual(disabled);
  }
});

it('renders successive results for repeated events without mutating earlier state', async () => {
  const fixture = TestBed.createComponent(SheetPage);
  fixture.componentInstance.eventItems.set([
    { type: 'event', name: 'repeated' },
    { type: 'event', name: 'repeated' },
  ]);
  await fixture.whenStable();
  const initial = fixture.componentInstance.eventItems();
  const helper = TestBed.inject(HelperService);
  const colors = () =>
    [...fixture.nativeElement.querySelectorAll('ion-icon[slot="end"]')].map(
      (icon) => icon.color,
    );
  expect(colors()).toEqual([]);

  await helper.updateItem(
    fixture.componentInstance.eventItems,
    'repeated',
    true,
  );
  await fixture.whenStable();
  expect(colors()).toEqual(['success']);
  await helper.updateItem(
    fixture.componentInstance.eventItems,
    'repeated',
    false,
  );
  await fixture.whenStable();
  expect(colors()).toEqual(['success', 'danger']);
  expect(initial.map((item) => item.result)).toEqual([undefined, undefined]);
});
