import { registerPlugin } from '@capacitor/core';

import type { StripePlugin } from './definitions';
import { embeddedPaymentElementAPI, type EmbeddedNativeBridge } from './private/embedded-placement';

const bridge = registerPlugin<EmbeddedNativeBridge>('Stripe', {
  web: () => import('./web').then((m) => new m.StripeWeb()),
});

const Stripe: StripePlugin = bridge;
export const EmbeddedPaymentElement = embeddedPaymentElementAPI(bridge);

export * from './definitions';
export { Stripe };
