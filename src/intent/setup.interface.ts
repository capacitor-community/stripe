import type {CommonIntentOptions} from '../definitions';

export interface ConfirmSetupIntentOptions extends CommonIntentOptions {
  id: string;
}

export interface ConfirmSetupIntentResponse {
  /**
   * Unix timestamp representing creation time
   */
  created: number;
  /**
   * Setup intent ID
   */
  id: string;
  /**
   * Whether the setup intent was created in live mode
   */
  isLiveMode: boolean;
  /**
   * Payment method ID
   */
  paymentMethodId: string;
  status: string;
  usage: string;
}
