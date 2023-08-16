import { registerPlugin } from '@capacitor/core';

import type { StripePlugin } from './definitions';

const Stripe = registerPlugin<StripePlugin>('Stripe', {
  web: () => import('./web').then((m) => new m.StripeWeb()),
});

export * from './definitions';
export { Stripe };
