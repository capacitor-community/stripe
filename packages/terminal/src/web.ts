import { WebPlugin } from '@capacitor/core';

import type {
  StripeTerminalPlugin,
  TerminalConnectTypes,
  ReaderInterface,
} from './definitions';
import { TerminalEventsEnum } from './events.enum';

export class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalPlugin
{
  async initialize(options: {
    tokenProviderEndpoint: string;
    isTest: boolean;
  }): Promise<void> {
    console.log('initialize', options);
    this.notifyListeners(TerminalEventsEnum.Loaded, null);
  }

  async discoverReaders(options: {
    type: TerminalConnectTypes;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }> {
    console.log('discoverReaders', options);
    this.notifyListeners(TerminalEventsEnum.DiscoveredReaders, {
      readers: [],
    });
    return {
      readers: [],
    };
  }

  async connectReader(options: { reader: ReaderInterface }): Promise<void> {
    console.log('connectReader', options);
    this.notifyListeners(TerminalEventsEnum.ConnectedReader, null);
  }

  async getConnectedReader(): Promise<{ reader: ReaderInterface | null }> {
    return {
      reader: null,
    };
  }

  async disconnectReader(): Promise<void> {
    console.log('disconnectReader');
    this.notifyListeners(TerminalEventsEnum.DisconnectedReader, null);
  }

  async collect(options: { paymentIntent: string }): Promise<void> {
    console.log('collect', options);
    this.notifyListeners(TerminalEventsEnum.Completed, null);
  }

  async cancelCollect(): Promise<void> {
    console.log('cancelCollect');
    this.notifyListeners(TerminalEventsEnum.Canceled, null);
  }
}
