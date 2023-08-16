import { WebPlugin } from '@capacitor/core';

import type { StripeIdentityPlugin } from './definitions';

export class StripeIdentityWeb
  extends WebPlugin
  implements StripeIdentityPlugin
{
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
