import type { BankAccount } from '@stripe/stripe-js/types/api/bank-accounts';
import type {Token} from '@stripe/stripe-js/types/api/tokens';

/**
 * @extends BankAccount
 */
export type createBankAccountTokenOption = BankAccount

export interface createPIITokenOption {
  /**
   * The `id_number` for the PII, in string form.
   */
  idNumber: number;
}

export interface createCVCTokenOption {
  /**
   * The CVC value, in string form.
   */
  cvc: string;
}


export interface TokensDefinitions {
  /**
   * Creates a single-use token that represents a bank account’s details. This token can be used with any API method in place of a bank account object. This token can be used only once, by attaching it to a Custom account.
   * @url https://stripe.com/docs/api/tokens/create_bank_account
   */
  createBankAccountToken(options: createBankAccountTokenOption): Promise<Token>;

  /**
   * Creates a single-use token that represents the details of personally identifiable information (PII). This token can be used in place of an id_number or id_number_secondary in Account or Person Update API methods. A PII token can be used only once.
   * @url https://stripe.com/docs/api/tokens/create_pii
   */
  createPIIToken(options: createPIITokenOption): Promise<Token>;

  /**
   * Creates a single-use token that represents an updated CVC value to be used for CVC re-collection. This token can be used when confirming a card payment using a saved card on a PaymentIntent with confirmation_method: manual.
   * For most cases, use our JavaScript library instead of using the API. For a PaymentIntent with confirmation_method: automatic, use our recommended payments integration without tokenizing the CVC value.
   * @url https://stripe.com/docs/api/tokens/create_cvc_update
   */
  createCVCToken(options: createCVCTokenOption): Promise<Token>
}
