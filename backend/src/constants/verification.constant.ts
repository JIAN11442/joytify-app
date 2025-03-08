enum VerificationForOptions {
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_RESET = "password_reset",
}

enum VerificationCodeActions {
  CODE_CREATED = "code_created",
  CODE_UPDATED = "code_updated",
  CODE_RETURNED = "code_returned",

  LINK_CREATED = "link_created",
  LINK_UPDATED = "link_updated",
}

export type VerificationForType =
  (typeof VerificationForOptions)[keyof typeof VerificationForOptions];

export { VerificationForOptions, VerificationCodeActions };
