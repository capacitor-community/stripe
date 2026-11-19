import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { BillingPage } from './billing.page';
import { beforeEach, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({
  platform: 'ios',
  listeners: new Map<string, (event: any) => void>(),
  initialize: vi.fn(),
  reset: vi.fn(),
  setCustomerSession: vi.fn(),
  getBuyButton: vi.fn(),
  presentBuyButton: vi.fn(),
  getActiveEntitlements: vi.fn(),
  hasEntitlement: vi.fn(),
  presentCustomerPortal: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => mock.platform },
}));
vi.mock('@capacitor-community/stripe-billing', () => ({
  StripeBilling: {
    ...mock,
    addListener: vi.fn(async (name, callback) => {
      mock.listeners.set(name, callback);
      return { remove: mock.remove };
    }),
  },
}));
import { BillingService } from './billing.service';

let billing: BillingService;
let http: HttpTestingController;
const demo = {
  token: 'automatic-test-session',
  publishableKey: 'pk_test_demo',
  buyButtonId: 'buy_btn_demo',
  entitlementLookupKey: 'premium',
};
const entitlement = { id: 'ent_1', feature: 'feat_1', lookupKey: 'premium' };
const flushStart = (token = demo.token) => {
  const request = http.expectOne((r) => r.url.endsWith('/billing/demo'));
  expect(request.request.method).toBe('POST');
  expect(request.request.body).toEqual({});
  expect(request.request.headers.has('Authorization')).toBe(false);
  request.flush({ ...demo, token });
};

beforeEach(() => {
  vi.clearAllMocks();
  mock.platform = 'ios';
  mock.listeners.clear();
  mock.initialize.mockResolvedValue(undefined);
  mock.reset.mockResolvedValue(undefined);
  mock.setCustomerSession.mockResolvedValue(undefined);
  mock.getBuyButton.mockResolvedValue({ id: demo.buyButtonId, active: true });
  mock.presentBuyButton.mockResolvedValue(undefined);
  mock.presentCustomerPortal.mockResolvedValue(undefined);
  mock.getActiveEntitlements.mockResolvedValue({ entitlements: [] });
  mock.hasEntitlement.mockResolvedValue({ active: false });
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideIonicAngular(),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  billing = TestBed.inject(BillingService);
  http = TestBed.inject(HttpTestingController);
});

it('starts purchase with one action, prepares the demo and presents the native button in order', async () => {
  const work = billing.runScenario('purchase');
  expect(billing.busy()).toBe(true);
  flushStart();
  await work;
  expect(mock.initialize).toHaveBeenCalledWith({
    publishableKey: demo.publishableKey,
  });
  expect(mock.getBuyButton).toHaveBeenCalledWith({ id: demo.buyButtonId });
  expect(mock.presentBuyButton).toHaveBeenCalledWith({ id: demo.buyButtonId });
  expect(mock.initialize.mock.invocationCallOrder[0]).toBeLessThan(
    mock.getBuyButton.mock.invocationCallOrder[0],
  );
  expect(mock.getBuyButton.mock.invocationCallOrder[0]).toBeLessThan(
    mock.presentBuyButton.mock.invocationCallOrder[0],
  );
  expect(billing.eventItems().map((i) => [i.name, i.result])).toEqual([
    ['HttpClient', true],
    ['initialize', true],
    ['getBuyButton', true],
    ['presentBuyButton', true],
  ]);
  expect(billing.access()).toBeNull();
  expect(billing.status()).toContain('does not confirm payment');
  expect(billing.busy()).toBe(false);
  http.verify();
});

it('keeps the same demo customer across purchase, portal and post-purchase entitlement checks', async () => {
  const purchase = billing.runScenario('purchase');
  flushStart();
  await purchase;
  await billing.runScenario('portal');
  expect(mock.presentCustomerPortal).toHaveBeenCalledOnce();
  mock.getActiveEntitlements.mockResolvedValue({ entitlements: [entitlement] });
  mock.hasEntitlement.mockResolvedValue({ active: true });
  await billing.runScenario('entitlements');
  expect(mock.getActiveEntitlements).toHaveBeenCalledWith({
    forceRefresh: true,
  });
  expect(mock.hasEntitlement).toHaveBeenCalledWith({
    lookupKey: 'premium',
    forceRefresh: true,
  });
  expect(billing.entitlements()).toEqual([entitlement]);
  expect(billing.access()).toBe(true);
  expect(billing.eventItems().every((i) => i.result === true)).toBe(true);
  expect(mock.initialize).toHaveBeenCalledOnce();
  http.verify();
});

it.each(['portal', 'entitlements'] as const)(
  'automatically prepares a fresh demo when %s is the first action',
  async (scenario) => {
    const work = billing.runScenario(scenario);
    flushStart();
    await work;
    expect(billing.connected()).toBe(true);
    expect(billing.eventItems().every((i) => i.result === true)).toBe(true);
    if (scenario === 'entitlements') expect(billing.access()).toBe(false);
    http.verify();
  },
);

it('fetches a fresh Customer Session for each SDK request and uses only the automatic credential', async () => {
  const work = billing.runScenario('purchase');
  flushStart();
  await work;
  for (const requestId of ['first', 'refresh']) {
    mock.listeners.get('customerSessionRequested')!({ requestId });
    const request = http.expectOne((r) =>
      r.url.endsWith('/billing/customer-session'),
    );
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer ' + demo.token,
    );
    request.flush({
      customer: 'cus_demo',
      clientSecret: 'fresh-' + requestId,
      expiresAt: 4102444800,
    });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(mock.setCustomerSession).toHaveBeenLastCalledWith({
      requestId,
      failed: false,
      session: {
        customer: 'cus_demo',
        clientSecret: 'fresh-' + requestId,
        expiresAt: 4102444800,
      },
    });
  }
  expect(billing.sessionRequests()).toBe(2);
  http.verify();
});

it('signs out, clears state and ignores late sessions and events before starting a new customer', async () => {
  mock.getActiveEntitlements.mockResolvedValue({ entitlements: [entitlement] });
  mock.hasEntitlement.mockResolvedValue({ active: true });
  const work = billing.runScenario('entitlements');
  flushStart('old-token');
  await work;
  expect(billing.entitlements()).toEqual([entitlement]);
  expect(billing.access()).toBe(true);
  const oldEntitlements = mock.listeners.get('entitlementsChanged')!;
  mock.listeners.get('customerSessionRequested')!({ requestId: 'old-request' });
  const pending = http.expectOne((r) =>
    r.url.endsWith('/billing/customer-session'),
  );
  await billing.runScenario('reset');
  expect(mock.reset).toHaveBeenCalledOnce();
  expect(mock.remove).toHaveBeenCalledTimes(3);
  expect(billing.connected()).toBe(false);
  expect(billing.entitlements()).toEqual([]);
  expect(billing.access()).toBeNull();
  const next = billing.runScenario('purchase');
  flushStart('new-token');
  await next;
  pending.flush({
    customer: 'cus_old',
    clientSecret: 'old-secret',
    expiresAt: 4102444800,
  });
  oldEntitlements({ entitlements: [entitlement] });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  expect(mock.setCustomerSession).not.toHaveBeenCalled();
  expect(billing.entitlements()).toEqual([]);
  expect(billing.sessionRequests()).toBe(0);
  http.verify();
});

it('marks a failed preparation and allows the same one-tap action to retry', async () => {
  const work = billing.runScenario('purchase');
  http
    .expectOne((r) => r.url.endsWith('/billing/demo'))
    .flush({}, { status: 503, statusText: 'Unavailable' });
  await work;
  expect(billing.eventItems()[0].result).toBe(false);
  expect(mock.presentBuyButton).not.toHaveBeenCalled();
  expect(billing.error()).not.toBe('');
  const retry = billing.runScenario('purchase');
  flushStart();
  await retry;
  expect(billing.error()).toBe('');
  expect(mock.presentBuyButton).toHaveBeenCalledOnce();
  http.verify();
});

it('does not fall back to an anonymous SDK session on a backend error', async () => {
  const work = billing.runScenario('purchase');
  flushStart();
  await work;
  mock.listeners.get('customerSessionRequested')!({ requestId: 'failed' });
  http
    .expectOne((r) => r.url.endsWith('/billing/customer-session'))
    .flush({}, { status: 401, statusText: 'Unauthorized' });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  expect(mock.setCustomerSession).toHaveBeenCalledWith({
    requestId: 'failed',
    session: null,
    failed: true,
  });
  http.verify();
});

it('does not start duplicate work while a scenario is preparing', async () => {
  const work = billing.runScenario('purchase');
  await billing.runScenario('purchase');
  flushStart();
  await work;
  expect(mock.initialize).toHaveBeenCalledOnce();
  http.verify();
});

it('does not issue HTTP or SDK calls on unsupported platforms', async () => {
  TestBed.resetTestingModule();
  mock.platform = 'android';
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideIonicAngular(),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  billing = TestBed.inject(BillingService);
  http = TestBed.inject(HttpTestingController);
  await billing.runScenario('purchase');
  expect(billing.supported).toBe(false);
  expect(mock.initialize).not.toHaveBeenCalled();
  http.verify();
});

it('exposes the same PROCESS / EXPECT one-tap UI as the other demos, without token inputs', async () => {
  const fixture = TestBed.createComponent(BillingPage);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  expect(root.querySelector('input, ion-input, form')).toBeNull();
  const actions = root.querySelectorAll('ion-item[button]');
  expect(actions).toHaveLength(4);
  actions[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
  flushStart();
  await fixture.whenStable();
  expect(mock.presentBuyButton).toHaveBeenCalledOnce();
  expect(root.textContent).toContain('EXPECT');
  expect(
    [...root.querySelectorAll('ion-icon')].filter(
      (icon) => (icon as HTMLElement & { color: string }).color === 'success',
    ),
  ).toHaveLength(4);
  fixture.destroy();
  http.verify();
});
