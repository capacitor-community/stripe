import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  CustomerSession,
  Entitlement,
  StripeBilling,
} from '@capacitor-community/stripe-billing';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { ITestItems } from '../shared/interfaces';

interface BillingDemo {
  token: string;
  publishableKey: string;
  buyButtonId: string;
  entitlementLookupKey: string;
}
export type BillingScenario = 'purchase' | 'portal' | 'entitlements' | 'reset';

@Injectable({ providedIn: 'root' })
export class BillingService {
  readonly #http = inject(HttpClient);
  readonly supported = Capacitor.getPlatform() === 'ios';
  readonly busy = signal(false);
  readonly connected = signal(false);
  readonly entitlements = signal<Entitlement[]>([]);
  readonly access = signal<boolean | null>(null);
  readonly sessionRequests = signal(0);
  readonly eventItems = signal<ITestItems[]>([]);
  readonly status = signal('Tap a scenario to start the test demo.');
  readonly error = signal('');
  #demo: BillingDemo | null = null;
  #generation = 0;
  readonly #listeners: PluginListenerHandle[] = [];

  runScenario(scenario: BillingScenario): Promise<void> {
    return this.#run(async () => {
      const methods =
        scenario === 'reset'
          ? ['reset']
          : [
              ...(this.connected() ? [] : ['HttpClient', 'initialize']),
              ...(scenario === 'purchase'
                ? ['getBuyButton', 'presentBuyButton']
                : scenario === 'portal'
                  ? ['presentCustomerPortal']
                  : ['getActiveEntitlements', 'hasEntitlement']),
            ];
      this.eventItems.set(methods.map((name) => ({ name, type: 'method' })));
      if (scenario === 'reset') {
        await this.#step('reset', () => this.#clearSession());
        this.status.set(
          'Signed out. Tap a scenario to start with a new test customer.',
        );
        return;
      }
      if (!this.connected()) {
        await this.#initialize().catch(async (error) => {
          await this.#clearSession();
          throw error;
        });
      }
      const demo = this.#demo!;
      if (scenario === 'purchase') {
        await this.#step('getBuyButton', async () => {
          const button = await StripeBilling.getBuyButton({
            id: demo.buyButtonId,
          });
          if (!button.active)
            throw new Error('The test subscription button is inactive.');
        });
        await this.#step('presentBuyButton', () =>
          StripeBilling.presentBuyButton({ id: demo.buyButtonId }),
        );
        this.status.set(
          'Complete test checkout, then close the sheet and tap Check entitlements. Opening the button does not confirm payment.',
        );
      } else if (scenario === 'portal') {
        await this.#step('presentCustomerPortal', () =>
          StripeBilling.presentCustomerPortal(),
        );
        this.status.set(
          'Manage the test subscription, then return and check entitlements.',
        );
      } else {
        await this.#step('getActiveEntitlements', async () => {
          const result = await StripeBilling.getActiveEntitlements({
            forceRefresh: true,
          });
          this.entitlements.set(result.entitlements);
        });
        await this.#step('hasEntitlement', async () => {
          const result = await StripeBilling.hasEntitlement({
            lookupKey: demo.entitlementLookupKey,
            forceRefresh: true,
          });
          this.access.set(result.active);
        });
        this.status.set(
          'Entitlements checked. A new customer has no premium access until the test subscription is active.',
        );
      }
    });
  }

  async #initialize(): Promise<void> {
    const demo = await this.#step('HttpClient', () =>
      firstValueFrom(
        this.#http
          .post<BillingDemo>(environment.api + 'billing/demo', {})
          .pipe(timeout(15000)),
      ),
    );
    this.#demo = demo;
    const generation = ++this.#generation;
    this.#listeners.push(
      await StripeBilling.addListener(
        'customerSessionRequested',
        ({ requestId }) => {
          void this.#provideSession(requestId, generation);
        },
      ),
    );
    this.#listeners.push(
      await StripeBilling.addListener(
        'entitlementsChanged',
        ({ entitlements }) => {
          if (generation === this.#generation)
            this.entitlements.set(entitlements);
        },
      ),
    );
    this.#listeners.push(
      await StripeBilling.addListener('billingError', ({ message }) => {
        if (generation === this.#generation) this.error.set(message);
      }),
    );
    await this.#step('initialize', () =>
      StripeBilling.initialize({ publishableKey: demo.publishableKey }),
    );
    this.connected.set(true);
  }

  async #provideSession(requestId: string, generation: number): Promise<void> {
    if (generation !== this.#generation || !this.#demo) return;
    this.sessionRequests.update((count) => count + 1);
    const result = await firstValueFrom(
      this.#http
        .post<CustomerSession>(
          environment.api + 'billing/customer-session',
          {},
          { headers: { Authorization: `Bearer ${this.#demo.token}` } },
        )
        .pipe(timeout(15000)),
    ).then(
      (session) => ({ session, failed: false }),
      () => ({ session: null, failed: true }),
    );
    if (generation !== this.#generation) return;
    await StripeBilling.setCustomerSession({ requestId, ...result }).catch(
      () => {
        if (generation === this.#generation)
          this.error.set(
            'Customer Session expired or was rejected. Sign out and start again.',
          );
      },
    );
    if (result.failed && generation === this.#generation)
      this.error.set(
        'Customer Session could not be loaded. Sign out and retry the scenario.',
      );
  }

  async #step<T>(name: string, action: () => Promise<T>): Promise<T> {
    return action().then(
      (result) => {
        this.#mark(name, true);
        return result;
      },
      (error) => {
        this.#mark(name, false);
        throw error;
      },
    );
  }

  #mark(name: string, result: boolean): void {
    this.eventItems.update((items) =>
      items.map((item) => (item.name === name ? { ...item, result } : item)),
    );
  }

  async #clearSession(): Promise<void> {
    ++this.#generation;
    this.#demo = null;
    await StripeBilling.reset().finally(async () => {
      await Promise.all(
        this.#listeners.splice(0).map((listener) => listener.remove()),
      );
      this.connected.set(false);
      this.entitlements.set([]);
      this.access.set(null);
      this.sessionRequests.set(0);
    });
  }

  async #run(action: () => Promise<void>): Promise<void> {
    if (!this.supported || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    return action()
      .catch((error) => {
        this.error.set(
          error instanceof HttpErrorResponse
            ? 'Unable to start the Billing demo. Check the demo server configuration and try again.'
            : error instanceof Error
              ? error.message
              : 'Billing operation failed.',
        );
        this.status.set(
          'Scenario did not complete. Retry or sign out to start again.',
        );
      })
      .finally(() => this.busy.set(false));
  }
}
