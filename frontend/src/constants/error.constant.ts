export enum ErrorCode {
  "InvalidAccessToken" = "InvalidAccessToken",
  "InvalidFirebaseCredential" = "InvalidFirebaseCredential",
  "CreateSongError" = "CreateSongError",
  "VerificationCodeRateLimitExceeded" = "VerificationCodeRateLimitExceeded",
}

export interface AppError extends Error {
  errorCode: ErrorCode;
}
