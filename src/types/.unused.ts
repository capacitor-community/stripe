import type { Address } from "@stripe/stripe-js";

export interface LegalEntity {
  address?: Address;
  dob?: {
    day: number;
    month: number;
    year: number;
  };
  first_name?: string;
  last_name?: string;
  gender?: 'male' | 'female';
  personal_address?: Address;
  business_name?: string;
  business_url?: string;
  business_tax_id_provided?: boolean;
  business_vat_id_provided?: string;
  country?: string;
  tos_acceptance?: {
    date: number;
    ip: string;
  };
  personal_id_number_provided?: boolean;
  phone_number?: string;
  ssn_last_4_provided?: boolean;
  tax_id_registrar?: string;
  type?: 'individual' | 'company';
  verification?: IndividualVerification | CompanyVerification;
  external_accounts?: any;
}

export interface Error {
  message: string;
}

export enum UIButtonType {
  SUBMIT = 'submit',
  CONTINUE = 'continue',
  NEXT = 'next',
  CANCEL = 'cancel',
  RESEND = 'resend',
  SELECT = 'select',
}

export interface UIButtonCustomizationOptions {
  type: UIButtonType;
  backgroundColor?: string;
  textColor?: string;
  fontName?: string;
  cornerRadius?: number;
  fontSize?: number;
}

export interface UICustomizationOptions {
  accentColor?: string;
  buttonCustomizations?: UIButtonCustomizationOptions[];
}

export interface CompanyVerification {
  document: CompanyVerificationDocument;
}

export interface CompanyVerificationDocument {
  front?: string;
  back?: string;
  details: string;
  details_code:
    | 'document_corrupt'
    | 'document_country_not_supported'
    | 'document_expired'
    | 'document_failed_copy'
    | 'document_failed_other'
    | 'document_failed_test_mode'
    | 'document_fraudulent'
    | 'document_failed_greyscale'
    | 'document_incomplete'
    | 'document_invalid'
    | 'document_manipulated'
    | 'document_missing_back'
    | 'document_missing_front'
    | 'document_not_readable'
    | 'document_not_uploaded'
    | 'document_photo_mismatch'
    | 'document_too_large'
    | 'document_type_not_supported';
}

export interface IndividualVerificationDocument {
  front?: string;
  back?: string;
  details_code:
    | 'document_corrupt'
    | 'document_country_not_supported'
    | 'document_expired'
    | 'document_failed_copy'
    | 'document_failed_other'
    | 'document_failed_test_mode'
    | 'document_fraudulent'
    | 'document_failed_greyscale'
    | 'document_incomplete'
    | 'document_invalid'
    | 'document_manipulated'
    | 'document_missing_back'
    | 'document_missing_front'
    | 'document_not_readable'
    | 'document_not_uploaded'
    | 'document_photo_mismatch'
    | 'document_too_large'
    | 'document_type_not_supported';
}

export interface IndividualVerification {
  status: 'unverified' | 'pending' | 'verified';
  details: string;
  details_code:
    | 'document_address_mismatch'
    | 'document_dob_mismatch'
    | 'document_duplicate_type'
    | 'document_id_number_mismatch'
    | 'document_name_mismatch'
    | 'document_nationality_mismatch'
    | 'failed_keyed_identity'
    | 'failed_other';
  document: IndividualVerificationDocument;
  additional_document?: IndividualVerificationDocument;
}
