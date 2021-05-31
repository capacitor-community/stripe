import type {CustomerPaymentMethodsResponse, StripeAccountIdOpt} from '../shared';

export interface PaymentDefinitions {
  initCustomerSession(opts: InitCustomerSessionParams): Promise<void>;

  customerPaymentMethods(): Promise<CustomerPaymentMethodsResponse>;

  setCustomerDefaultSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse>;

  addCustomerSource(opts: {
    sourceId: string;
    type?: string;
  }): Promise<CustomerPaymentMethodsResponse>;

  deleteCustomerSource(opts: {
    sourceId: string;
  }): Promise<CustomerPaymentMethodsResponse>;
}


export type InitCustomerSessionParams = {
  id: string;
  object: 'ephemeral_key';
  associated_objects: {
    type: 'customer';
    id: string;
  }[];
  created: number;
  expires: number;
  livemode: boolean;
  secret: string;
  apiVersion?: string;
} & StripeAccountIdOpt;
