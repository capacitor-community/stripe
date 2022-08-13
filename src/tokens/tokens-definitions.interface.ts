import type {Token} from '@stripe/stripe-js/types/api/tokens';
import type {CreateTokenBankAccountData, CreateTokenPiiData} from '@stripe/stripe-js/types/stripe-js/token-and-sources';

/**
 * @extends CreateTokenBankAccountData
 */
export type createBankAccountTokenOption = CreateTokenBankAccountData

/**
 * @extends CreateTokenPiiData
 */
export type createPIITokenOption = CreateTokenPiiData



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
}
