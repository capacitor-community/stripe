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

export interface CompanyVerification {
  document: CompanyVerificationDocument;
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
