import { Capacitor, registerPlugin } from '@capacitor/core';

import type { StripePlugin } from './definitions';
import { withEmbeddedPlacement, type EmbeddedNativeBridge } from './private/embedded-placement';

const bridge = registerPlugin<EmbeddedNativeBridge>('Stripe', {
  web: () => import('./web').then((m) => new m.StripeWeb()),
});

const Stripe: StripePlugin = Capacitor.isNativePlatform() ? withEmbeddedPlacement(bridge) : bridge;

export * from './definitions';
export { Stripe };
