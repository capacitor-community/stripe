import { registerPlugin } from '@capacitor/core';

import type { StripeIdentityPlugin } from './definitions';

const StripeIdentity = registerPlugin<StripeIdentityPlugin>('StripeIdentity', {
  web: () => import('./web').then((m) => new m.StripeIdentityWeb()),
});

export * from './definitions';
export { StripeIdentity };
