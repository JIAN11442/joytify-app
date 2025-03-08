enum VerificationForOptions {
  EMAIL_VERIFICATION = "email_verification",
  RESEND_EMAIL_VERIFICATION = "resend_email_verification",
  VERIFY_EMAIL = "verify_email",
  PASSWORD_RESET = "password_reset",
}

enum VerificationCodeActions {
  CODE_CREATED = "code_created",
  CODE_UPDATED = "code_updated",
  CODE_RETURNED = "code_returned",
  CODE_SEND_FAILED = "code_send_failed",
  EMAIL_SUCCESS_VERIFIED = "email_success_verified",
  EMAIL_VERIFY_FAILED = "email_verify_failed",
}

// ===================== Enum Keys Types =====================

export type VerificationForType =
  (typeof VerificationForOptions)[keyof typeof VerificationForOptions];

export type VerificationCodeActionType =
  (typeof VerificationCodeActions)[keyof typeof VerificationCodeActions];

export { VerificationForOptions, VerificationCodeActions };
