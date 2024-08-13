import { WebPlugin } from '@capacitor/core';
import type { ISdkManagedPaymentIntent } from '@stripe/terminal-js';
import { loadStripeTerminal } from '@stripe/terminal-js';
import type {
  DiscoverResult,
  ErrorResponse,
  Reader,
  Terminal,
} from '@stripe/terminal-js/types/terminal';

import { TerminalConnectTypes } from './definitions';
import type {
  StripeTerminalPlugin,
  ReaderInterface,
  SimulateReaderUpdate,
  SimulatedCardType,
  Cart,
} from './definitions';
import { TerminalEventsEnum } from './events.enum';
import {
  convertReaderInterface,
  mapFromConnectionStatus,
  mapFromPaymentStatus,
} from './terminalMappers';

export class StripeTerminalWeb
  extends WebPlugin
  implements StripeTerminalPlugin
{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private stripeTerminal: Terminal | undefined = undefined;
  private tokenProviderPromiseResolve: ((value: string) => void) | undefined =
    undefined;
  private discoveredReaders: ReaderInterface[] = [];
  private cachedFindReaders: Reader[] = [];
  private cachedPaymentIntent: ISdkManagedPaymentIntent | undefined = undefined;
  private isTest = false;

  async initialize(options: {
    tokenProviderEndpoint: string;
    isTest: boolean;
  }): Promise<void> {
    if (this.stripeTerminal !== undefined) {
      throw new Error('Stripe Terminal has already been initialized');
    }

    this.isTest = options.isTest;
    const stripeTerminal = await loadStripeTerminal();
    this.stripeTerminal = stripeTerminal?.create({
      onFetchConnectionToken: async () => {
        this.notifyListeners(TerminalEventsEnum.RequestedConnectionToken, null);
        if (options.tokenProviderEndpoint) {
          const response = await fetch(options.tokenProviderEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          return data.secret;
        } else {
          return new Promise<string>(
            resolve => (this.tokenProviderPromiseResolve = resolve),
          );
        }
      },
      onConnectionStatusChange: status => {
        this.notifyListeners(TerminalEventsEnum.ConnectionStatusChange, {
          status: mapFromConnectionStatus(status.status),
        });
      },
      onPaymentStatusChange: status => {
        this.notifyListeners(TerminalEventsEnum.PaymentStatusChange, {
          status: mapFromPaymentStatus(status.status),
        });
      },
      onUnexpectedReaderDisconnect: () => {
        this.notifyListeners(TerminalEventsEnum.UnexpectedReaderDisconnect, {
          reader: null,
        });
      },
    });
    this.notifyListeners(TerminalEventsEnum.Loaded, null);
  }

  async discoverReaders(options: {
    type: TerminalConnectTypes;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }> {
    if (this.stripeTerminal === undefined) {
      throw new Error('Stripe Terminal has not been initialized');
    }

    if (options.type !== TerminalConnectTypes.Internet) {
      this.unavailable(
        `${options.type} is selected. Web platform is supported only internet connection.`,
      );
    }

    const discoverResult = await this.stripeTerminal.discoverReaders({
      simulated: this.isTest,
      location: options.locationId,
    });

    if ((discoverResult as ErrorResponse).error) {
      throw new Error((discoverResult as ErrorResponse).error.message);
    }
    this.cachedFindReaders = (
      discoverResult as DiscoverResult
    ).discoveredReaders;
    this.discoveredReaders = (
      discoverResult as DiscoverResult
    ).discoveredReaders.map(reader => convertReaderInterface(reader));
    this.notifyListeners(TerminalEventsEnum.DiscoveredReaders, {
      readers: this.discoveredReaders,
    });

    return {
      readers: this.discoveredReaders,
    };
  }

  /**
   * This method is not supported in the web platform.
   */
  async cancelDiscoverReaders(): Promise<void> {
    console.log('cancelDiscoverReaders');
  }

  async setConnectionToken(options: { token: string }): Promise<void> {
    if (this.tokenProviderPromiseResolve === undefined) {
      return;
    }
    console.log('setConnectionToken', options);
    this.tokenProviderPromiseResolve(options.token);
  }

  async setSimulatorConfiguration(options: {
    update?: SimulateReaderUpdate | undefined;
    simulatedCard?: SimulatedCardType | undefined;
    simulatedTipAmount?: number | undefined;
  }): Promise<void> {
    console.log('setSimulatorConfiguration', options);
  }

  async connectReader(options: { reader: ReaderInterface }): Promise<void> {
    const reader = this.cachedFindReaders.find(
      reader => reader.serial_number === options.reader.serialNumber,
    );
    if (reader === undefined) {
      throw new Error('reader is not match from descovered readers.');
    }
    const connectedResult = await this.stripeTerminal?.connectReader(reader);
    if ((connectedResult as ErrorResponse).error) {
      throw new Error((connectedResult as ErrorResponse).error.message);
    }
    this.notifyListeners(TerminalEventsEnum.ConnectedReader, null);
  }

  async getConnectedReader(): Promise<{ reader: ReaderInterface | null }> {
    const reader = this.stripeTerminal?.getConnectedReader();
    if (reader === undefined) {
      return {
        reader: null,
      };
    }
    return {
      reader: convertReaderInterface(reader),
    };
  }

  async disconnectReader(): Promise<void> {
    await this.stripeTerminal?.disconnectReader();
    this.notifyListeners(TerminalEventsEnum.DisconnectedReader, null);
  }

  async collectPaymentMethod(options: {
    paymentIntent: string;
  }): Promise<void> {
    const collectResult = await this.stripeTerminal?.collectPaymentMethod(
      options.paymentIntent,
    );

    if ((collectResult as ErrorResponse).error) {
      throw new Error((collectResult as ErrorResponse).error.message);
    }

    this.cachedPaymentIntent = (
      collectResult as {
        paymentIntent: ISdkManagedPaymentIntent;
      }
    ).paymentIntent;

    this.notifyListeners(TerminalEventsEnum.CollectedPaymentIntent, null);
  }

  async cancelCollectPaymentMethod(): Promise<void> {
    await this.stripeTerminal?.cancelCollectPaymentMethod();
    this.notifyListeners(TerminalEventsEnum.Canceled, null);
  }

  async confirmPaymentIntent(): Promise<void> {
    if (this.cachedPaymentIntent === undefined) {
      throw new Error('PaymentIntent is not cached.');
    }
    const processResult = await this.stripeTerminal?.processPayment(
      this.cachedPaymentIntent,
    );
    if ((processResult as ErrorResponse).error) {
      throw new Error((processResult as ErrorResponse).error.message);
    }
    this.notifyListeners(TerminalEventsEnum.ConfirmedPaymentIntent, null);
  }

  async installAvailableUpdate(): Promise<void> {
    console.log('installAvailableUpdate');
  }
  async cancelInstallUpdate(): Promise<void> {
    console.log('cancelInstallUpdate');
  }
  async setReaderDisplay(options: Cart): Promise<void> {
    console.log('setReaderDisplay', options);
  }
  async clearReaderDisplay(): Promise<void> {
    console.log('clearReaderDisplay');
  }
  async rebootReader(): Promise<void> {
    console.log('rebootReader');
  }
  async cancelReaderReconnection(): Promise<void> {
    console.log('cancelReaderReconnection');
  }

  collect = 'deprecated';
  cancelCollect = 'deprecated';
}
