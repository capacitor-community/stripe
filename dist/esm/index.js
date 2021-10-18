import { registerPlugin } from '@capacitor/core';
const Stripe = registerPlugin('Stripe', {
    web: () => import('./web').then(m => new m.StripeWeb()),
});
export * from './definitions';
export { Stripe };
//# sourceMappingURL=index.js.map