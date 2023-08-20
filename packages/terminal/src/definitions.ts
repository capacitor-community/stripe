export enum TerminalConnectType {
  Simulated = 'simulated',
  Internet = 'internet',
  Bluetooth = 'bluetooth',
  Usb = 'usb',
  TapToPay = 'tap-to-pay',
}

export interface StripeTerminalPlugin {
  initialize(options: { tokenProviderEndpoint: string }): Promise<void>;
  connect(options: {
    type: TerminalConnectType,
    locationId?: number,
  }): Promise<void>;
  collect(options: {
    paymentIntent: string;
  }) : Promise<void>;
}
