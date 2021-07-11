export enum GooglePayBillingAddressFormat {
  /**
   * Name, country code, and postal code (default).
   */
  MIN = 'MIN',
  /**
   *  Name, street address, locality, region, country code, and postal code.
   */
  FULL = 'FULL',
}


export enum GooglePayAuthMethod {
  /**
   * This authentication method is associated with payment cards stored on file with the user's Google Account.
   * Returned payment data includes personal account number (PAN) with the expiration month and the expiration year.
   */
  PAN_ONLY = 'PAN_ONLY',
  /**
   * This authentication method is associated with cards stored as Android device tokens.
   * Returned payment data includes a 3-D Secure (3DS) cryptogram generated on the device.
   */
  CRYPTOGRAM_3DS = 'CRYPTOGRAM_3DS',
}

export enum GooglePayPriceStatus {
  /**
   * Used for a capability check. Do not use this property if the transaction is processed in an EEA country.
   */
  NOT_CURRENTLY_KNOWN = 'NOT_CURRENTLY_KNOWN',
  /**
   * Total price may adjust based on the details of the response, such as sales tax collected based on a billing address.
   */
  ESTIMATED = 'ESTIMATED',
  /**
   * Total price doesn't change from the amount presented to the shopper.
   */
  FINAL = 'FINAL',
}
