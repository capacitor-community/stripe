import { registerPlugin } from '@capacitor/core';

import type { StripeTerminalAppOnDevicesPlugin } from './definitions';

const StripeTerminalAppOnDevices = registerPlugin<StripeTerminalAppOnDevicesPlugin>('StripeTerminalAppOnDevices', {
  web: () => import('./web').then((m) => new m.StripeTerminalAppOnDevicesWeb()),
});

export * from './definitions';
export { StripeTerminalAppOnDevices };
