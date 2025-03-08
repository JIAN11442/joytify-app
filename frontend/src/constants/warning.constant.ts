enum WarningOptions {
  // token warning
  IS_FETCHING_TOKEN = "isFetchingToken",
  VALID_TOKEN = "validToken",
  INVALID_TOKEN = "invalidToken",

  // password warning
  INVALID_PASSWORD_REGEX = "passwordRegexIsInvalid",
  PASSWORD_IS_DUPLICATED = "passwordIsDuplicated",
  PASSWORD_IS_NOT_MATCH = "passwordIsNotMatch",
}

export type WarningType = (typeof WarningOptions)[keyof typeof WarningOptions];

export default WarningOptions;
