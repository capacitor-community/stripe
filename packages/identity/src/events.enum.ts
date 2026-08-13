export enum IdentityVerificationSheetEventsEnum {
  Loaded = 'identityVerificationSheetLoaded',
  FailedToLoad = 'identityVerificationSheetFailedToLoad',
  Completed = 'identityVerificationSheetCompleted',
  Canceled = 'identityVerificationSheetCanceled',
  Failed = 'identityVerificationSheetFailed',
  VerificationResult = 'identityVerificationResult',
}

/** Final state reported by the Identity verification flow. */
export type IdentityVerificationSheetResultInterface =
  | IdentityVerificationSheetEventsEnum.Completed
  | IdentityVerificationSheetEventsEnum.Canceled
  | IdentityVerificationSheetEventsEnum.Failed;
