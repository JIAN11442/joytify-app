const enum AuthForOptions {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
}

export type AuthForType = "sign-in" | "sign-up" | "forgot-password";

export default AuthForOptions;
