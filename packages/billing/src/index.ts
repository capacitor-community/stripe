import { registerPlugin } from '@capacitor/core';

import type { StripeBillingPlugin } from './definitions';

// iOS only. Capacitor rejects calls on unsupported platforms as UNIMPLEMENTED.
const StripeBilling = registerPlugin<StripeBillingPlugin>('StripeBilling');

export * from './definitions';
export { StripeBilling };
