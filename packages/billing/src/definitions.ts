import type { PluginListenerHandle } from '@capacitor/core';

export interface InitializeOptions {
  publishableKey: string;
  /** Maximum age in seconds before refreshing entitlements. Default: 300. */
  maximumStaleEntitlementsDuration?: number;
}

export interface CustomerSession {
  customer: string;
  clientSecret: string;
  /** Unix timestamp in seconds, as returned by your authenticated backend. */
  expiresAt: number;
}

export interface CustomerSessionResponse {
  requestId: string;
  /** A fresh session, or null only when the user is signed out. */
  session: CustomerSession | null;
  /** Set true on backend/network failure. Do not silently fall back to anonymous checkout. */
  failed?: boolean;
}

export interface Entitlement {
  id: string;
  feature: string;
  lookupKey: string;
}

export interface BuyButton {
  id: string;
  active: boolean;
  callToAction?: string;
  /** Amount in minor currency units, as a string supplied by Stripe. */
  amount: string;
  currency: string;
}

/** Experimental, iOS 15+ and Swift Package Manager only. Android/web are unsupported. */
export interface StripeBillingPlugin {
  /** Register customerSessionRequested before initialization. Call reset before changing users. */
  initialize(options: InitializeOptions): Promise<void>;
  /** Complete one session request within 30 seconds. Stale/duplicate responses are rejected. */
  setCustomerSession(options: CustomerSessionResponse): Promise<void>;
  getBuyButton(options: { id: string }): Promise<BuyButton>;
  /** Present the SDK's native buy button. Resolves on presentation, not payment completion. */
  presentBuyButton(options: { id: string }): Promise<void>;
  getActiveEntitlements(options?: { forceRefresh?: boolean }): Promise<{ entitlements: Entitlement[] }>;
  hasEntitlement(options: { lookupKey: string; forceRefresh?: boolean }): Promise<{ active: boolean }>;
  /** Opens the portal in-app by default. Resolves on presentation/launch, not subscription change. */
  presentCustomerPortal(options?: { external?: boolean }): Promise<void>;
  /** Cancel pending work, dismiss plugin UI, clear session/caches. initialize again before reuse. */
  reset(): Promise<void>;
  /** Fetch a new Customer Session from your backend for each request; never cache its secret. */
  addListener(
    eventName: 'customerSessionRequested',
    listenerFunc: (event: { requestId: string }) => void,
  ): Promise<PluginListenerHandle>;
  /** SDK refresh notifications; not a server push subscription. */
  addListener(
    eventName: 'entitlementsChanged',
    listenerFunc: (event: { entitlements: Entitlement[] }) => void,
  ): Promise<PluginListenerHandle>;
  /** Errors from tapping the presented native buy button. */
  addListener(
    eventName: 'billingError',
    listenerFunc: (event: { message: string }) => void,
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}
