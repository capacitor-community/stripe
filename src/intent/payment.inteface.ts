import type { PaymentMethod } from '../definitions';

export interface ConfirmPaymentIntentResponse {
  amount: number;
  capture_method: string;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  cad: string;
  livemode: boolean;
  object: string;
  payment_method: PaymentMethod;
  payment_method_types: string[];
  status: string;
}
