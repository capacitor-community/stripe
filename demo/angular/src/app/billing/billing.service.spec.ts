import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

const mock = vi.hoisted(() => ({
  listeners: new Map<string, (event: { requestId: string }) => void>(),
  setCustomerSession: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'ios' } }));
vi.mock('@capacitor-community/stripe-billing', () => ({
  StripeBilling: {
    initialize: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn().mockResolvedValue(undefined),
    setCustomerSession: mock.setCustomerSession,
    addListener: vi.fn(async (name, callback) => {
      mock.listeners.set(name, callback);
      return { remove: vi.fn().mockResolvedValue(undefined) };
    }),
  },
}));

import { BillingService } from './billing.service';

it('does not deliver a late Customer Session after reset and reconnect', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const billing = TestBed.inject(BillingService);
  const http = TestBed.inject(HttpTestingController);
  const config = {
    publishableKey: 'pk_test_demo',
    buyButtonId: 'buy_btn_demo',
    entitlementLookupKey: 'premium',
  };
  const firstConnection = billing.connect('first-token');
  http
    .expectOne((request) => request.url.endsWith('/billing/config'))
    .flush(config);
  await firstConnection;
  mock.listeners.get('customerSessionRequested')!({ requestId: 'old-request' });
  const pending = http.expectOne((request) =>
    request.url.endsWith('/billing/customer-session'),
  );
  expect(pending.request.headers.get('Authorization')).toBe(
    'Bearer first-token',
  );
  await billing.reset();
  const nextConnection = billing.connect('next-token');
  http
    .expectOne((request) => request.url.endsWith('/billing/config'))
    .flush(config);
  await nextConnection;
  pending.flush({
    customer: 'cus_old',
    clientSecret: 'old-secret',
    expiresAt: 4102444800,
  });
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  expect(mock.setCustomerSession).not.toHaveBeenCalled();
  expect(billing.connected()).toBe(true);
  expect(billing.sessionRequests()).toBe(0);
  await billing.reset();
  http.verify();
});
