export enum TerminalConnectType {
  Simulated = 'simulated',
  Internet = 'internet',
  Bluetooth = 'bluetooth',
  Usb = 'usb',
  TapToPay = 'tap-to-pay',
}

export type ReaderInterface = {
  index: number;
  serialNumber: string;
};

export interface StripeTerminalPlugin {
  initialize(options: { tokenProviderEndpoint: string }): Promise<void>;
  discoverReaders(options: {
    type: TerminalConnectType;
    locationId?: string;
  }): Promise<{
    readers: ReaderInterface[];
  }>;
  connectReader(options: { reader: ReaderInterface }): Promise<void>;
  collect(options: { paymentIntent: string }): Promise<void>;
}
