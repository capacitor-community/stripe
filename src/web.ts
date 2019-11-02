import { WebPlugin } from '@capacitor/core';
import { StripePluginPlugin } from './definitions';

export class StripePluginWeb extends WebPlugin implements StripePluginPlugin {
  constructor() {
    super({
      name: 'StripePlugin',
      platforms: ['web']
    });
  }

  async echo(options: { value: string }): Promise<{value: string}> {
    console.log('ECHO', options);
    return options;
  }
}

const StripePlugin = new StripePluginWeb();

export { StripePlugin };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(StripePlugin);
