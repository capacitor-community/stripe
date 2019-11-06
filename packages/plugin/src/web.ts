import { registerWebPlugin, WebPlugin } from '@capacitor/core';


export class StripePluginWeb extends WebPlugin {
  constructor() {
    super({
      name: 'StripePlugin',
      platforms: ['web'],
    });
  }

  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}

const StripePlugin = new StripePluginWeb();

export { StripePlugin };


registerWebPlugin(StripePlugin);
