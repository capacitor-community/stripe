export interface StripeTerminalPlugin {
  initialize(options: { tokenProviderEndpoint: string }): Promise<void>;
  connect(options: {
    type: 'simulated' | 'internet' | 'bluetooth' | 'usb' | 'tap-to-pay'
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
