enum PasswordResetStatus {
  INITIAL = "initial",
  SUCCESS = "success",
  FAILED = "failed",
}

export type PasswordResetStatusType =
  (typeof PasswordResetStatus)[keyof typeof PasswordResetStatus];

export { PasswordResetStatus };
