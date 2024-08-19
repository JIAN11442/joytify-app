import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verification-code.model";

import appAssert from "../utils/app-assert.util";
import {
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
  RefreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt.util";
import sendEmail from "../utils/send-email.util";

import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from "../constants/http-code.constant";
import { ORIGIN_APP } from "../constants/env-validate.constant";
import VerificationCodeType from "../constants/verification-code.constant";
import { HashValue } from "../utils/bcrypt.util";
import { Request } from "express";

interface AuthDefaults {
  email: string;
  password: string;
  userAgent?: string;
}

interface LoginParams extends AuthDefaults {
  req?: Request;
}

interface RegisterParams extends AuthDefaults {
  confirmPassword: string;
}

// create account service
export const createAccount = async (data: RegisterParams) => {
  // verify email if exist
  const isEmailExist = await UserModel.findOne({ email: data.email });

  appAssert(!isEmailExist, CONFLICT, "Email is already in use");

  // create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
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
    { userId: user.id, sessionId: session.id },
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
  const isPasswordMatch = await user.comparePassword(data.password);

  appAssert(isPasswordMatch, UNAUTHORIZED, "Invalid email or password");

  // return if user is already logged in
  const existAccessToken = data.req?.cookies.accessToken;

  if (existAccessToken) {
    const { payload } = await verifyToken(
      existAccessToken,
      AccessTokenSignOptions
    );

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
    { userId: user.id, sessionId: session.id },
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
  const { payload } = await verifyToken(accessToken, AccessTokenSignOptions);

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

type resetPasswordParams = {
  verificationCode: string;
  password: string;
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
