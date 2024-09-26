enum AuthForOptions {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
}

export type AuthForType = (typeof AuthForOptions)[keyof typeof AuthForOptions];

export default AuthForOptions;
