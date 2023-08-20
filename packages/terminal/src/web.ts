import { WebPlugin } from '@capacitor/core';

import type { StripeTerminalPlugin, TerminalConnectType } from './definitions';

export class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalPlugin
{
  async initialize(options: { tokenProviderEndpoint: string }): Promise<void> {
    console.log('initialize', options);
  }
  async connect(options: {
    type: TerminalConnectType;
    locationId?: number;
  }): Promise<void> {
    console.log('connect', options);
  }
  async collect(options: { paymentIntent: string }): Promise<void> {
    console.log('collect', options);
  }
}
