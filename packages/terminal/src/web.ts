import { WebPlugin } from '@capacitor/core';

import type { StripeTerminalPlugin } from './definitions';

export class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalPlugin
{
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
