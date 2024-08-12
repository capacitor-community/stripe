import { WebPlugin } from '@capacitor/core';

import type {
  StripeTerminalPlugin,
  TerminalConnectTypes,
  ReaderInterface,
  SimulateReaderUpdate,
  SimulatedCardType,
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

  async cancelDiscoverReaders(): Promise<void> {
    console.log('cancelDiscoverReaders');
    this.notifyListeners(TerminalEventsEnum.CancelDiscoveredReaders, null);
  }

  async setConnectionToken(): Promise<void> {
    console.log('setConnectionToken');
  }

  async setSimulatorConfiguration(options: {
    update?: SimulateReaderUpdate | undefined;
    simulatedCard?: SimulatedCardType | undefined;
    simulatedTipAmount?: number | undefined;
  }): Promise<void> {
    console.log('setSimulatorConfiguration', options);
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

  async collectPaymentMethod(options: {
    paymentIntent: string;
  }): Promise<void> {
    console.log('collectPaymentMethod', options);
    this.notifyListeners(TerminalEventsEnum.CollectedPaymentIntent, null);
  }

  async cancelCollectPaymentMethod(): Promise<void> {
    console.log('cancelCollectPaymentMethod');
    this.notifyListeners(TerminalEventsEnum.Canceled, null);
  }

  async confirmPaymentIntent(): Promise<void> {
    console.log('confirmPaymentIntent');
    this.notifyListeners(TerminalEventsEnum.ConfirmedPaymentIntent, null);
  }

  collect = 'deprecated';
  cancelCollect = 'deprecated';
}
