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
    type: typeof TerminalConnectType,
    location?: {
      display_name: string;
      address: {
        line1: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
      },
    }
  }): Promise<void>;
  collect(options: {
    paymentIntent: string;
  }) : Promise<void>;
}
