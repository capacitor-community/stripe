/** Properties of a TipOption. */
interface ITipOption {
  /** REQUIRED: Amount of this tip option */
  amount?: number | null;

  /** Descriptor of the amount, displayed in the button */
  label?: string | null;
}
/** Properties of a TipConfiguration. */
export interface ITipConfiguration {
  /** List of at most 3 options */
  options?: ITipOption[] | null;

  /** Hide the custom amount button */
  hide_custom_amount?: boolean | null;
}
/** Properties of a TipSelection. */
interface ITipSelection {
  /** Amount associated with the selection */
  amount?: number | null;
}
/** CreditCardBrand enum. */
type CreditCardBrand =
  | 'INVALID_CREDIT_CARD_BRAND'
  | 'UNKNOWN_CREDIT'
  | 'AMERICAN_EXPRESS'
  | 'DINERS'
  | 'DISCOVER'
  | 'JCB'
  | 'MASTERCARD'
  | 'VISA'
  | 'CUP';

/** CardEntryMethod enum. */
type CardEntryMethod =
  | 'INVALID_ENTRY_METHOD'
  | 'CHIP_READ'
  | 'CONTACTLESS'
  | 'FSWIPE'
  | 'KEYED'
  | 'SWIPED'
  | 'BARCODE_READ';
/** Properties of a CardPaymentMethod. */
interface ICardPaymentMethod {
  /** Masked card data */
  masked_pan?: string | null;

  /** The card expiration date */
  expiration_date?: string | null;

  /** Brand of credit card tender, determined by BIN table lookup */
  card_brand?: CreditCardBrand | null;

  /** Entry method of payment */
  card_entry_method?: CardEntryMethod | null;
}
/** Properties of a PaymentMethod. */
export interface IPaymentMethod {
  /** PaymentMethod card_payment */
  card_payment?: ICardPaymentMethod | null;

  /** Tip selection chosen by the cardholder */
  tip_selection?: ITipSelection | null;
}
/** Properties of a PaymentMethod. */
export interface IPaymentMethodReadReusableResponse {
  /** Unique identifier for the Payment Method object */
  id?: string | null;

  /** Time at which the Payment Method object was created. Measured in seconds since the Unix epoch */
  created?: number | null;

  /** Customer ID */
  customer?: string | null;

  /** Whether this charge was made in live mode or not */
  livemode?: boolean | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** PaymentMethod type */
  type?: string | null;

  /** Card representation of payment method */
  card?: ICardPaymentMethodReadReusableResponse | null;
}

/** Properties of a CardPaymentMethod. */
interface ICardPaymentMethodReadReusableResponse {
  /** Masked card data */
  masked_pan?: string | null;

  /** The card expiration date */
  expiration_date?: string | null;

  /** Brand of credit card tender, determined by BIN table lookup */
  card_brand?: CreditCardBrand | null;

  /** Entry method of payment */
  card_entry_method?: CardEntryMethod | null;
}

/** Properties of an ErrorResponse. */
export interface IErrorResponse {
  /** The type of error returned. */
  type?: string | null;

  /** ID of failed charge */
  charge?: string | null;

  /** For some errors that could be handled programmatically, a short string indicating the error code reported. (https://stripe.com/docs/error-codes) */
  code?: string | null;

  /** For card errors resulting from a card issuer decline, a short string indicating the card issuer’s reason for the decline if they provide one. (https://stripe.com/docs/declines#issuer-declines) */
  decline_code?: string | null;

  /** A URL to more information about the error code reported. */
  doc_url?: string | null;

  /** A human-readable message providing more details about the error. For card errors, these messages can be shown to your users. */
  message?: string | null;

  /** If the error is parameter-specific, the parameter related to the error. For example, you can use this to display a message near the correct form field. */
  param?: string | null;

  /** Source used for the error */
  source?: ISource | null;

  /** Payment intent used for the error */
  payment_intent?: IPaymentIntent | null;
}
/** Properties of an Owner. */
export interface IOwner {
  /** Owner address */
  address?: string | null;

  /** Owner email */
  email?: string | null;

  /** Owner name */
  name?: string | null;

  /** Owner phone */
  phone?: string | null;

  /** Owner verified_address */
  verified_address?: string | null;

  /** Owner verified_email */
  verified_email?: string | null;

  /** Owner verified_name */
  verified_name?: string | null;

  /** Owner verified_phone */
  verified_phone?: string | null;
}
/** Properties of a PaymentMethodDetails. */
export interface IPaymentMethodDetails {
  /** Payment Method type (e.g. "card_present") */
  type?: string | null;

  /** PaymentMethodDetails card_present */
  card_present?: ICardPresent | null;

  /** PaymentMethodDetails interac_present */
  interac_present?: ICardPresent | null;
}
/** Properties of a Refund. */
interface IRefund {
  /** Refund id */
  id?: string | null;

  /** Refund amount */
  amount?: number | null;

  /** Refund charge */
  charge?: string | null;

  /** Time at which the Refund object was created. Measured in seconds since the Unix epoch */
  created?: number | null;

  /** Three-letter ISO currency code, in lowercase. Must be a supported currency */
  currency?: string | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** Reason for refund */
  reason?: string | null;

  /** Status of refund */
  status?: string | null;

  /** Actual details of the payment method */
  payment_method_details?: IPaymentMethodDetails | null;

  /** If the refund failed, the reason for refund failure if known. */
  failure_reason?: string | null;
}
/** Properties of a Refunds. */
interface IRefunds {
  /** Refunds data */
  data?: IRefund[] | null;

  /** Refunds has_more */
  has_more?: boolean | null;

  /** Refunds total_count */
  total_count?: number | null;
}
/** Properties of a Charge. */
interface ICharge {
  /** ID for charge */
  id?: string | null;

  /** Amount that is associated with the charge */
  amount?: number | null;

  /** Amount that is associated with a refund of the charge */
  amount_refunded?: number | null;

  /** Whether this charge has been captured */
  captured?: boolean | null;

  /** Whether this charge has been refunded */
  refunded?: boolean | null;

  /** Time at which the Charge object was created. Measured in seconds since the Unix epoch */
  created?: number | null;

  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency?: string | null;

  /** An arbitrary string attached to the object. Often useful for displaying to users. */
  description?: string | null;

  /** An arbitrary string to be displayed on your customer's credit card statement. */
  statement_descriptor?: string | null;

  /** Email address that the receipt for the resulting payment will be sent to. */
  receipt_email?: string | null;

  /** Failure code if the charge was declined */
  failure_code?: string | null;

  /** Message associated with the failure code */
  failure_message?: string | null;

  /** Whether this charge was made in live mode or not */
  livemode?: boolean | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** Source associated with the charge */
  source?: ISource | null;

  /** Payment intent ID associated with the charge */
  payment_intent?: string | null;

  /** Status of the charge */
  status?: string | null;

  /** Payment method ID */
  payment_method?: string | null;

  /** Actual details of the payment method */
  payment_method_details?: IPaymentMethodDetails | null;

  /** Whether the charge was paid */
  paid?: boolean | null;

  /** Receipt URL */
  receipt_url?: string | null;

  /** Refunds associated with charge */
  refunds?: IRefunds | null;
}
/** Properties of a Charges. */
interface ICharges {
  /** Charges data */
  data?: ICharge[] | null;

  /** Charges has_more */
  has_more?: boolean | null;

  /** Charges total_count */
  total_count?: number | null;
}
/** Properties of a CardPresent. */
interface ICardPresent {
  /** The last four digits of the card. */
  last4?: string | null;

  /** Card brand */
  brand?: string | null;

  /** Customer's signature if signed */
  evidence_customer_signature?: string | null;

  /** Method used by POS to read the card */
  read_method?: string | null;

  /** The EMV authorization response payload */
  emv_auth_data?: string | null;

  /** The EMV authorization response code */
  authorization_response_code?: string | null;

  /** AID */
  dedicated_file_name?: string | null;

  /** AID name */
  application_preferred_name?: string | null;

  /** TVR */
  terminal_verification_results?: string | null;

  /** TSI */
  transaction_status_information?: string | null;

  /** CVM type */
  cvm_type?: string | null;

  /** CardPresent reader */
  reader?: string | null;

  /** CardPresent fingerprint */
  fingerprint?: string | null;

  /** CardPresent authorization_code */
  authorization_code?: string | null;
}
/** Properties of a Source. */
export interface ISource {
  /** Unique identifier for the source card object. */
  id?: string | null;

  /** Source type (e.g. "card_present") */
  type?: string | null;

  /** Card payment method */
  card_present?: ICardPresent | null;

  /** Interac version of card present */
  interac_present?: ICardPresent | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** Owner data */
  owner?: IOwner | null;
}
export interface IPaymentIntent {
  /** Unique identifier for the Payment Intent object */
  id?: string | null;

  /** Time at which the Payment Intent object was created. Measured in seconds since the Unix epoch */
  created?: number | null;

  /** Status of this PaymentIntent */
  status?: string | null;

  /** Amount intended to be collected by this Payment Intent */
  amount?: number | null;

  /** Three-letter ISO currency code, in lowercase. Must be a supported currency. */
  currency?: string | null;

  /** Card present payment source field map */
  source?: ISource | null;

  /** An arbitrary string to be displayed on your customer's credit card statement. */
  statement_descriptor?: string | null;

  /** An arbitrary string attached to the object. Often useful for displaying to users. */
  description?: string | null;

  /** Email address that the receipt for the resulting payment will be sent to. */
  receipt_email?: string | null;

  /** Whether this charge was made in live mode or not */
  livemode?: boolean | null;

  /** Last payment error on a charge (if retrieved) */
  last_payment_error?: IErrorResponse | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** Charges associated with the payment intent */
  charges?: ICharges | null;

  /** ID for payment method */
  payment_method?: string | null;
}

export interface ISetupIntent {
  /** Unique identifier for the object. */
  id?: string | null;

  /** The client secret of this SetupIntent. Used for client-side retrieval using a publishable key. */
  client_secret?: string | null;

  /** ID of the Customer this SetupIntent belongs to, if one exists. */
  customer?: string | null;

  /** An arbitrary string attached to the object. Often useful for displaying to users. */
  description?: string | null;

  /** The error encountered in the previous SetupIntent confirmation. */
  last_setup_error?: ILastSetupError | null;

  /** Meta data in JSON format */
  metadata?: { [k: string]: string } | null;

  /** If present, this property tells you what actions you need to take in order for your customer to continue payment setup. */
  next_action?: INextAction | null;

  /** ID of the payment method used with this SetupIntent. */
  payment_method?: string | null;

  /** The list of payment method types (e.g. card) that this SetupIntent is allowed to set up. */
  payment_method_types?: string[] | null;

  /** Status of this SetupIntent, one of requires_payment_method, requires_confirmation, requires_action, processing, canceled, or succeeded. */
  status?: string | null;

  /** Indicates how the payment method is intended to be used in the future. */
  usage?: string | null;

  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created?: number | null;

  /** The most recent SetupAttempt for this SetupIntent. */
  latest_attempt?: ISetupAttempt | null;

  /** Has the value true if the object exists in live mode or the value false if the object exists in test mode. */
  livemode?: boolean | null;

  /** ID of the multi use Mandate generated by the SetupIntent. */
  mandate?: string | null;

  /** ID of the single_use Mandate generated by the SetupIntent. */
  single_use_mandate?: string | null;

  /** ID of the Connect application that created the SetupIntent. */
  application?: string | null;

  /** The account (if any) for which the setup is intended. */
  on_behalf_of?: string | null;

  /** Payment-method-specific configuration for this SetupIntent. */
  payment_method_options?: IPaymentMethodOptions | null;
}

/** Properties of a SetupAttempt. */
export interface ISetupAttempt {
  /** Unique identifier for the object. */
  id?: string | null;

  /** String representing the object’s type: "setup_attempt" */
  object?: string | null;

  /** ID of the Connect application that created the SetupIntent. */
  application?: string | null;

  /** Time at which the object was created. Measured in seconds since the Unix epoch. */
  created?: number | null;

  /** ID of the Customer this SetupIntent belongs to, if one exists. */
  customer?: string | null;

  /** Has the value true if the object exists in live mode or the value false if the object exists in test mode. */
  livemode?: boolean | null;

  /** The account (if any) for which the setup is intended. */
  on_behalf_of?: string | null;

  /** ID of the payment method used with this SetupAttempt. */
  payment_method?: string | null;

  /** Details about the payment method at the time of SetupIntent confirmation. */
  payment_method_details?: IPaymentMethodDetails | null;

  /** The error encountered during this attempt to confirm the SetupIntent, if any. */
  setup_error?: ISetupError | null;

  /** ID of the SetupIntent that this attempt belongs to. */
  setup_intent?: string | null;

  /** Status of this SetupAttempt, one of requires_confirmation, requires_action, processing, succeeded, failed, or abandoned. */
  status?: string | null;

  /** The value of usage on the SetupIntent at the time of this confirmation, one of off_session or on_session. */
  usage?: string | null;
}

/** Properties of a SetupError. */
export interface ISetupError {
  /** For some errors that could be handled programmatically, a short string indicating the error code reported. */
  code?: string | null;

  /** For card errors resulting from a card issuer decline, a short string indicating the card issuer’s reason for the decline if they provide one. */
  decline_code?: string | null;

  /** A URL to more information about the error code reported. */
  doc_url?: string | null;

  /** A human-readable message providing more details about the error. For card errors, these messages can be shown to your users. */
  message?: string | null;

  /** If the error is parameter-specific, the parameter related to the error. For example, you can use this to display a message near the correct form field. */
  param?: string | null;

  /** The PaymentMethod object for errors returned on a request involving a PaymentMethod. */
  payment_method?: IPaymentMethod | null;

  /** If the error is specific to the type of payment method, the payment method type that had a problem. This field is only populated for invoice-related errors. */
  payment_method_type?: string | null;

  /** The type of error returned. One of api_connection_error, api_error, authentication_error, card_error, idempotency_error, invalid_request_error, or rate_limit_error */
  type?: string | null;
}

/** Properties of an ActivateTerminalRequest. */
export interface IActivateTerminalRequest {
  /** An activation token obtained from Stripe that can be used to activate the reader */
  pos_activation_token?: string | null;

  /** The fingerprint for the POS authenticating to rabbit */
  pos_device_id?: string | null;

  /** The terminal-app-on-devices hardware information */
  pos_hardware_info?: any | null;

  /** The terminal-app-on-devices software information */
  pos_software_info?: any | null;

  /** Provide RPC error if reader is currently in use */
  fail_if_in_use?: boolean | null;

  /** The logical identity of terminal-app-on-devices (i.e. lane number) authenticating to rabbit. */
  terminal_id?: string | null;

  /** ActivateTerminalRequest terminal_ip */
  terminal_ip?: string | null;

  /** The store name associated with the POS */
  store_name?: string | null;

  /** The store address associated with the POS */
  store_address?: any | null;
}

/** Properties of a SetReaderDisplayRequest. */
export interface ISetReaderDisplayRequest {
  /** SetReaderDisplayRequest type */
  type?: string | null;

  /** SetReaderDisplayRequest cart */
  cart?: ICart | null;
}

export interface ICart {
  /** All line items in the basket */
  line_items?: ILineItem[] | null;

  /** Modifiers that have been applied to the basket. */
  modifiers?: IModifier[] | null;

  /** Any discounts that have been added to the basket. */
  discounts?: IDiscount[] | null;

  /** Tenders that have been charged/refunded */
  tenders?: ITender[] | null;

  /** Total amount of tax */
  tax?: number | null;

  /** Total balance of cart due */
  total?: number | null;

  /** The currency of the basket (i.e. USD or AUD). */
  currency?: string | null;
}

/** Properties of a LineItem. */
interface ILineItem {
  /** LineItem quantity */
  quantity?: number | null;

  /** A detailed description of the item. */
  description?: string | null;

  /** This is equal to extended_price - discount + modifiers */
  amount?: number | null;

  /** The discounts that have been applied to this line item. */
  discounts?: IDiscount[] | null;

  /** The modifiers that have been applied to this line item. */
  modifiers?: IModifier[] | null;
}

interface IModifier {
  /** A detailed description of discount. */
  description?: string | null;

  /** Amount in cents of the modification. */
  amount?: number | null;
}
/** Properties of a Discount. */
interface IDiscount {
  /** A detailed description of discount. */
  description?: string | null;

  /** The amount and mechanism of the discount */
  amount?: number | null;
}
/** Properties of a Tender. */
interface ITender {
  /** A detailed description of tender. */
  description?: string | null;

  /** Amount in cents of the tender. */
  amount?: number | null;
}

interface ILastSetupError {
  /** For some errors that could be handled programmatically, a short string indicating the error code reported. */
  code?: string | null;

  /** For card errors resulting from a card issuer decline, a short string indicating the card issuer’s reason for the decline if they provide one. */
  decline_code?: string | null;

  /** A URL to more information about the error code reported. */
  doc_url?: string | null;

  /** A human-readable message providing more details about the error. For card errors, these messages can be shown to users. */
  message?: string | null;

  /** If the error is parameter-specific, the parameter related to the error. For example, you can use this to display a message near the correct form field. */
  param?: string | null;

  /** The PaymentMethod object for errors returned on a request involving a PaymentMethod. */
  payment_method?: IPaymentMethod | null;

  /** One of: api_connection_error, api_error, authentication_error, card_error, idempotency_error, invalid_request_error, or rate_limit_error */
  type?: string | null;
}

interface INextAction {
  /** Contains instructions for authenticating by redirecting your customer to another page or application. */
  redirect_to_url?: IRedirectToUrl | null;

  /** Type of the next action to perform, one of redirect_to_url or use_stripe_sdk. */
  type?: string | null;

  /** When confirming a SetupIntent with Stripe.js, Stripe.js depends on the contents of this dictionary to invoke authentication flows. */
  use_stripe_sdk?: { [k: string]: string } | null;
}

interface IRedirectToUrl {
  /** If the customer does not exit their browser while authenticating, they will be redirected to this specified URL after completion. */
  return_url?: string | null;

  /** The URL you must redirect your customer to in order to authenticate. */
  url?: string | null;
}
interface IPaymentMethodOptions {
  /** PaymentMethodOptions card */
  card?: ICardOptions | null;
}

interface ICardOptions {
  /** CardOptions request_three_d_secure */
  request_three_d_secure?: Request3dSecureType | null;
}

type Request3dSecureType = 'automatic' | 'any';
