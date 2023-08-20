import { WebPlugin } from '@capacitor/core';

import type {
  StripeTerminalPlugin,
  TerminalConnectType,
  ReaderInterface,
} from './definitions';

export class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalPlugin
{
  async initialize(options: { tokenProviderEndpoint: string }): Promise<void> {
    console.log('initialize', options);
  }

  async discoverReaders(options: {
    type: TerminalConnectType;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }> {
    console.log('discoverReaders', options);
    return {
      readers: [],
    };
  }

  async connectReader(options: { reader: ReaderInterface }): Promise<void> {
    console.log('connectReader', options);
  }

  async collect(options: { paymentIntent: string }): Promise<void> {
    console.log('collect', options);
  }
}
