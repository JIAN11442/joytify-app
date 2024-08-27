import { Request } from "express";
import * as admin from "firebase-admin";

import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verification-code.model";

import appAssert from "../utils/app-assert.util";
import {
  oneDay,
  oneHourFromNow,
  onYearFromNow,
  thirtyDaysFormNow,
  thirtySecondsAgo,
} from "../utils/date.util";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/email-template.util";
import {
  AccessTokenSignOptions,
  RefreshTokenPayload,
  RefreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt.util";
import sendEmail from "../utils/send-email.util";

import {
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http-code.constant";
import { ORIGIN_APP } from "../constants/env-validate.constant";
import VerificationCodeType from "../constants/verification-code.constant";
import { HashValue } from "../utils/bcrypt.util";
import ErrorCode from "../constants/error-code.constant";

interface AuthDefaults {
  email: string;
  password?: string;
  userAgent?: string;
  profile_img?: string;
  authForThirdParty?: boolean;
  firebaseUID?: string;
}

interface LoginParams extends AuthDefaults {
  req?: Request;
}

interface RegisterParams extends AuthDefaults {
  confirmPassword?: string;
}

type resetPasswordParams = {
  verificationCode: string;
  password: string;
};

// create account service
export const createAccount = async (data: RegisterParams) => {
  // verify email if exist
  const isEmailExist = await UserModel.findOne({ email: data.email });

  appAssert(!isEmailExist, CONFLICT, "Email is already in use");

  // create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
    profile_img: data.profile_img,
    auth_for_third_party: data.authForThirdParty,
  });

  // send verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user.id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: onYearFromNow(),
  });

  // send verification email
  const url = `${ORIGIN_APP}/email/verify?code=${verificationCode.id}`;

  const { data: emailData, error } = await sendEmail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  appAssert(
    emailData?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name}-${error?.message}`
  );

  // create session
  const session = await SessionModel.create({
    userId: user.id,
    userAgent: data.userAgent,
    expiresAt: thirtyDaysFormNow(),
  });

  // sign access token and refresh token
  const accessToken = signToken(
    {
      userId: user.id,
      sessionId: session.id,
      firebaseUserId: data.firebaseUID,
    },
    AccessTokenSignOptions
  );

  const refreshToken = signToken(
    { sessionId: session.id },
    RefreshTokenSignOptions
  );

  // return user and tokens
  return { user: user.omitPassword(), accessToken, refreshToken };
};

// verify email service
export const verifyEmail = async (code: string) => {
  // verify verificationCode
  const verificationCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: new Date() },
  });

  appAssert(
    verificationCode,
    NOT_FOUND,
    "Invalid or expired verification code"
  );

  // update user verified status to true
  const updatedUser = await UserModel.findByIdAndUpdate(
    verificationCode.userId,
    {
      verified: true,
    },
    { new: true }
  );

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  // delete verification code
  await verificationCode.deleteOne();

  // return updated user
  return {
    user: updatedUser.omitPassword(),
  };
};

// login service
export const loginUser = async (data: LoginParams) => {
  // find user by email
  const user = await UserModel.findOne({ email: data.email });

  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // validate password
  if (!data.authForThirdParty && data.password) {
    const isPasswordMatch = await user.comparePassword(data.password);

    appAssert(isPasswordMatch, UNAUTHORIZED, "Invalid email or password");
  }

  // return if user is already logged in
  const existAccessToken = data.req?.cookies.accessToken;

  if (existAccessToken) {
    const { payload } = await verifyToken(existAccessToken, {
      secret: AccessTokenSignOptions.secret,
    });

    const sessionIsExist = await SessionModel.exists({
      _id: payload?.sessionId,
      userId: payload?.userId,
      expiresAt: { $gt: new Date() },
    });

    appAssert(!sessionIsExist, CONFLICT, "User is already logged in");
  }

  // create session
  const session = await SessionModel.create({
    userId: user.id,
    userAgent: data.userAgent,
    expiresAt: thirtyDaysFormNow(),
  });

  // sign access token and refresh token
  const accessToken = signToken(
    {
      userId: user.id,
      sessionId: session.id,
      firebaseUserId: data.firebaseUID,
    },
    AccessTokenSignOptions
  );

  const refreshToken = signToken(
    {
      sessionId: session.id,
    },
    RefreshTokenSignOptions
  );

  // return tokens
  return { accessToken, refreshToken };
};

// logout service
export const logoutUser = async (accessToken: string) => {
  // verify access token
  const { payload } = await verifyToken(accessToken, {
    secret: AccessTokenSignOptions.secret,
  });

  // delete firebase user if firebaseUserId is exist
  if (payload?.firebaseUserId) {
    admin.auth().deleteUser(payload?.firebaseUserId);
  }

  // find session by userId and delete it
  return await SessionModel.findByIdAndDelete(payload?.sessionId);
};

// forgot password and send reset password email service
export const sendResetPasswordEmail = async (email: string) => {
  // find user by email
  const user = await UserModel.findOne({ email });

  appAssert(user, NOT_FOUND, "User not found");

  // check if verification code is duplicated within a certain period of time.
  const count = await VerificationCodeModel.countDocuments({
    userId: user.id,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: thirtySecondsAgo() },
  });

  // if count is greater than 0,
  // it means that the user has requested a password reset within a certain period of time.
  appAssert(
    count < 1,
    TOO_MANY_REQUESTS,
    "Too many requests, please try again later"
  );

  const expiresAt = oneHourFromNow();

  // create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId: user.id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  // send reset password email
  const url = `${ORIGIN_APP}/password/reset?code=${
    verificationCode.id
  }&exp=${expiresAt.getTime()}`;

  const { data: EmailData, error } = await sendEmail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });

  appAssert(
    EmailData?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name}-${error?.message}`
  );

  // return
  return {
    url,
    sentEmailId: EmailData.id,
  };
};

// reset password service
export const resetUserPassword = async (data: resetPasswordParams) => {
  // verify verification code
  const verificationCode = await VerificationCodeModel.findOne({
    _id: data.verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });

  appAssert(
    verificationCode,
    NOT_FOUND,
    "Invalid or expired verification code"
  );

  // check if new password is same as old password
  const user = await UserModel.findById(verificationCode.userId);
  const passwordIsConflict = await user?.comparePassword(data.password);

  appAssert(
    !passwordIsConflict,
    CONFLICT,
    "New password cannot be the same as the old password"
  );

  // update user password
  const updatedUser = await UserModel.findByIdAndUpdate(
    verificationCode.userId,
    {
      password: await HashValue(data.password),
    },
    { new: true }
  );

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  // delete reset password verification code
  await verificationCode.deleteOne();

  // delete all the user session
  await SessionModel.deleteMany({ userId: updatedUser.id });

  // return updated user
  return {
    user: updatedUser.omitPassword(),
  };
};

// refresh tokens service
export const refreshTokens = async (refreshToken: string) => {
  // verify refresh token
  const { payload } = await verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: RefreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  // find session by sessionId
  const now = new Date();

  const session = await SessionModel.findOne({
    _id: payload.sessionId,
    expiresAt: { $gt: now },
  });

  appAssert(session, UNAUTHORIZED, "session is expired");

  // if session expires in less than 1 day,
  // then need to create a refresh token and update session expiresAt time
  const sessionNeedToRefresh =
    session.expiresAt.getTime() - now.getTime() < oneDay();

  if (sessionNeedToRefresh) {
    // update session expiresAt time (new 30d expiresAt time)
    session.expiresAt = thirtyDaysFormNow();
    await session.save();
  }

  // sign a new refresh token (new 30d expiresAt time)
  const newRefreshToken = sessionNeedToRefresh
    ? signToken({ sessionId: session.id }, RefreshTokenSignOptions)
    : undefined;

  // sign access token (new 15min expiresAt time)
  const newAccessToken = signToken(
    {
      userId: session.userId,
      sessionId: session.id,
    },
    AccessTokenSignOptions
  );

  // return tokens
  return {
    newAccessToken,
    newRefreshToken,
  };
};

// verify firebase token service
export const verifyFirebaseAccessToken = async (token: string) => {
  // verify firebase access token
  const decodedUser = await admin.auth().verifyIdToken(token);

  const { email, uid, picture } = decodedUser;

  appAssert(
    decodedUser,
    UNAUTHORIZED,
    "Invalid firebase access token",
    ErrorCode.InvalidFirebaseCredential,
    uid
  );

  // if third party not provide email, then return error
  appAssert(
    email,
    INTERNAL_SERVER_ERROR,
    "Third-party do not provide email",
    ErrorCode.InvalidFirebaseCredential,
    uid
  );

  const generatePicture = picture?.replace("s96-c", "s384-c");

  return { email, generatePicture, uid };
};

// login with third-party service
export const loginUserWithThirdParty = async (token: string) => {
  // verify firebase access token
  const { email, uid } = await verifyFirebaseAccessToken(token);

  // find user
  const user = await UserModel.findOne({ email: email });

  // if user is not exist
  appAssert(
    user,
    NOT_FOUND,
    "User not found",
    ErrorCode.InvalidFirebaseCredential,
    uid
  );

  // if those user is exist but not auth for third party
  appAssert(
    user.auth_for_third_party,
    FORBIDDEN,
    "This account was signed up without third-party. Please log in with password to access the account.",
    ErrorCode.InvalidFirebaseCredential,
    uid
  );

  // if those user is exist and auth for third party
  // then execute login service
  const { accessToken, refreshToken } = await loginUser({
    email,
    password: "",
    authForThirdParty: true,
    firebaseUID: uid,
  });

  return { accessToken, refreshToken };
};

// register with third-party service
export const registerUserWithThirdParty = async (token: string) => {
  // verify firebase access token
  const { email, generatePicture, uid } = await verifyFirebaseAccessToken(
    token
  );

  // register service
  const { user, accessToken, refreshToken } = await createAccount({
    email,
    password: "",
    profile_img: generatePicture,
    authForThirdParty: true,
    firebaseUID: uid,
  });

  return { user, accessToken, refreshToken };
};
