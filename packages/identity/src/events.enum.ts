export enum IdentityVerificationSheetEventsEnum {
  Loaded = 'identityVerificationSheetLoaded',
  FailedToLoad = 'identityVerificationSheetFailedToLoad',
  Completed = 'identityVerificationSheetCompleted',
  Canceled = 'identityVerificationSheetCanceled',
  Failed = 'identityVerificationSheetFailed',
  VerificationResult = 'identityVerificationResult'
}

export type IdentityVerificationSheetResultInterface =
  | IdentityVerificationSheetEventsEnum.Completed
  | IdentityVerificationSheetEventsEnum.Canceled
  | IdentityVerificationSheetEventsEnum.Failed;
