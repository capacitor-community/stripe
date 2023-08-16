import { registerPlugin } from '@capacitor/core';

import type { StripeTerminalPlugin } from './definitions';

const StripeTerminal = registerPlugin<StripeTerminalPlugin>('StripeTerminal', {
  web: () => import('./web').then(m => new m.StripeTerminalWeb()),
});

export * from './definitions';
export { StripeTerminal };
