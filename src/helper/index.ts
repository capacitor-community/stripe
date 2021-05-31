import type { CardBrand, PaymentMethod} from '../shared';

export interface HelperDefinitions {

  customizePaymentAuthUI(opts: any): Promise<void>;

  presentPaymentOptions(): Promise<PresentPaymentOptionsResponse>;

  validateCardNumber(
    opts: ValidateCardNumberOptions,
  ): Promise<ValidityResponse>;

  validateExpiryDate(
    opts: ValidateExpiryDateOptions,
  ): Promise<ValidityResponse>;

  validateCVC(opts: ValidateCVCOptions): Promise<ValidityResponse>;

  identifyCardBrand(opts: IdentifyCardBrandOptions): Promise<CardBrandResponse>;
}


export type CardBrandResponse = { brand: CardBrand };

export type IdentifyCardBrandOptions = {
  number: string;
};

export type PresentPaymentOptionsResponse = {
  useGooglePay?: boolean;
  useApplePay?: boolean;
  paymentMethod?: PaymentMethod;
};

export type ValidateCardNumberOptions = {
  number: string;
};

export type ValidateCVCOptions = {
  cvc: string;
};


export type ValidateExpiryDateOptions = {
  exp_month: number;
  exp_year: number;
};

export type ValidityResponse = { valid: boolean };
