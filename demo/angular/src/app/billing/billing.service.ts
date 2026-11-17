import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  BuyButton,
  CustomerSession,
  Entitlement,
  StripeBilling,
} from '@capacitor-community/stripe-billing';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

interface BillingConfig {
  publishableKey: string;
  buyButtonId: string;
  entitlementLookupKey: string;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  readonly #http = inject(HttpClient);
  readonly supported = Capacitor.getPlatform() === 'ios';
  readonly busy = signal(false);
  readonly connected = signal(false);
  readonly config = signal<BillingConfig | null>(null);
  readonly button = signal<BuyButton | null>(null);
  readonly entitlements = signal<Entitlement[]>([]);
  readonly access = signal<boolean | null>(null);
  readonly sessionRequests = signal(0);
  readonly status = signal('Enter the demo token to connect.');
  readonly error = signal('');
  #token = '';
  #generation = 0;
  readonly #listeners: PluginListenerHandle[] = [];

  connect(token: string): Promise<void> {
    return this.#run(() =>
      this.#initialize(token).catch(async (error) => {
        await this.#clearSession();
        throw error;
      }),
    );
  }

  async #initialize(token: string): Promise<void> {
    this.#token = token.trim();
    const config = await firstValueFrom(
      this.#http
        .get<BillingConfig>(environment.api + 'billing/config', {
          headers: { Authorization: `Bearer ${this.#token}` },
        })
        .pipe(timeout(15000)),
    );
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
    await StripeBilling.initialize({ publishableKey: config.publishableKey });
    this.config.set(config);
    this.connected.set(true);
    this.status.set('Connected. Load or present the subscription button.');
  }

  async #provideSession(requestId: string, generation: number): Promise<void> {
    if (generation !== this.#generation) return;
    this.sessionRequests.update((count) => count + 1);
    const result = await firstValueFrom(
      this.#http
        .post<CustomerSession>(
          environment.api + 'billing/customer-session',
          {},
          {
            headers: { Authorization: `Bearer ${this.#token}` },
          },
        )
        .pipe(timeout(15000)),
    ).then(
      (session) => ({ session, failed: false }),
      // A 401 for this fixed demo user is a failure, not anonymous checkout.
      () => ({ session: null, failed: true }),
    );
    if (generation !== this.#generation) return;
    await StripeBilling.setCustomerSession({ requestId, ...result }).catch(
      () => {
        if (generation === this.#generation)
          this.error.set(
            'Customer Session response expired or was rejected. Reset and reconnect.',
          );
      },
    );
    if (result.failed && generation === this.#generation)
      this.error.set(
        'Customer Session could not be loaded. Check the token, preview access and server configuration.',
      );
  }

  loadButton(): Promise<void> {
    return this.#run(async () => {
      this.button.set(
        await StripeBilling.getBuyButton({ id: this.config()!.buyButtonId }),
      );
      this.status.set('Buy button loaded.');
    });
  }

  presentButton(): Promise<void> {
    return this.#run(async () => {
      await StripeBilling.presentBuyButton({ id: this.config()!.buyButtonId });
      this.status.set(
        'Button presented. After checkout, close the sheet and refresh entitlements. Presentation is not proof of payment.',
      );
    });
  }

  refresh(): Promise<void> {
    return this.#run(async () => {
      const result = await StripeBilling.getActiveEntitlements({
        forceRefresh: true,
      });
      this.entitlements.set(result.entitlements);
      this.status.set('Entitlements refreshed.');
    });
  }

  checkAccess(): Promise<void> {
    return this.#run(async () => {
      const result = await StripeBilling.hasEntitlement({
        lookupKey: this.config()!.entitlementLookupKey,
        forceRefresh: true,
      });
      this.access.set(result.active);
      this.status.set('Feature access checked.');
    });
  }

  portal(external = false): Promise<void> {
    return this.#run(async () => {
      await StripeBilling.presentCustomerPortal({ external });
      this.status.set(
        'Portal opened. Refresh entitlements after returning from the external browser.',
      );
    });
  }

  reset(): Promise<void> {
    return this.#run(async () => {
      await this.#clearSession();
      this.status.set(
        'Signed out. Session, token and displayed results cleared.',
      );
    });
  }

  async #clearSession(): Promise<void> {
    ++this.#generation;
    // Retain listeners until native reset completes. Late HTTP responses are ignored.
    this.#token = '';
    await StripeBilling.reset();
    await Promise.all(
      this.#listeners.splice(0).map((listener) => listener.remove()),
    );
    this.connected.set(false);
    this.config.set(null);
    this.button.set(null);
    this.entitlements.set([]);
    this.access.set(null);
    this.sessionRequests.set(0);
  }

  #run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    return action()
      .catch((error) => {
        this.error.set(
          error instanceof HttpErrorResponse
            ? 'Unable to connect. Check the server URL, demo token and Billing configuration.'
            : error instanceof Error
              ? error.message
              : 'Billing operation failed.',
        );
      })
      .finally(() => this.busy.set(false));
  }
}
