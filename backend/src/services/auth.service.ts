import _ from "lodash";
import * as admin from "firebase-admin";

import UserModel from "../models/user.model";
import SessionModel from "../models/session.model";
import { HttpCode, ErrorCode } from "@joytify/shared-types/constants";
import { oneDay, thirtyDaysFormNow } from "../utils/date.util";
import appAssert from "../utils/app-assert.util";
import {
  AccessTokenSignOptions,
  RefreshTokenPayload,
  RefreshTokenSignOptions,
  signToken,
  UserPreferenceSignOptions,
  verifyToken,
} from "../utils/jwt.util";
import { SessionInfo } from "@joytify/shared-types/types";

type AuthServiceRequest = {
  email: string;
  password?: string;
  sessionInfo: SessionInfo;
  profileImage?: string;
  authForThirdParty?: boolean;
  firebaseUID?: string;
};

export interface LoginServiceRequest extends AuthServiceRequest {
  accessToken?: string;
}

export interface CreateAccountServiceRequest extends AuthServiceRequest {
  confirmPassword?: string;
  verified?: boolean;
}

export interface AuthWithThirdPartyServiceRequest {
  token: string;
  sessionInfo: SessionInfo;
}

const { UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, BAD_REQUEST } = HttpCode;
const { INVALID_FIREBASE_CREDENTIAL } = ErrorCode;

// create account service
export const createAccount = async (data: CreateAccountServiceRequest) => {
  const isEmailExist = await UserModel.findOne({ email: data.email });

  appAssert(!isEmailExist, CONFLICT, "Email is already in use");

  // create user
  const user = await UserModel.create({
    email: data.email,
    username: data.email.split("@")[0],
    password: data.password,
    profileImage: data.profileImage,
    authForThirdParty: data.authForThirdParty,
    verified: true,
  });

  // create session
  const session = await SessionModel.create({
    user: user.id,
    ...data.sessionInfo,
    expiresAt: thirtyDaysFormNow(),
  });

  // sign access token
  const accessToken = signToken(
    {
      userId: user.id,
      sessionId: session.id,
      firebaseUserId: data.firebaseUID,
    },
    AccessTokenSignOptions
  );

  // sign refresh token
  const refreshToken = signToken({ sessionId: session.id }, RefreshTokenSignOptions);

  // sign user preferences
  const ui_prefs = signToken(
    _.omit(user.toObject().userPreferences, "notifications"),
    UserPreferenceSignOptions
  );

  // return user and tokens
  return { user: user.omitPassword(), accessToken, refreshToken, ui_prefs };
};

// login service
export const loginUser = async (data: LoginServiceRequest) => {
  const user = await UserModel.findOne({ email: data.email });

  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  // validate password
  if (!data.authForThirdParty) {
    // if user is registered with third-party service, but try to login with password
    appAssert(
      !user.authForThirdParty,
      FORBIDDEN,
      "This account was registered using a third-party service. Please log in with related service to access the account."
    );

    if (data.password) {
      const isPasswordMatch = await user.comparePassword(data.password);

      appAssert(isPasswordMatch, UNAUTHORIZED, "Invalid email or password");
    }
  }

  // return if user is already logged in
  if (data.accessToken) {
    const { payload } = await verifyToken(data.accessToken, {
      secret: AccessTokenSignOptions.secret,
    });

    const sessionIsExist = await SessionModel.exists({
      _id: payload?.sessionId,
      user: payload?.userId,
      expiresAt: { $gt: new Date() },
    });

    appAssert(!sessionIsExist, CONFLICT, "User is already logged in");
  }

  // create session
  const session = await SessionModel.create({
    user: user.id,
    ...data.sessionInfo,
    expiresAt: thirtyDaysFormNow(),
  });

  // sign access token
  const accessToken = signToken(
    {
      userId: user.id,
      sessionId: session.id,
      firebaseUserId: data.firebaseUID,
    },
    AccessTokenSignOptions
  );

  // sign refresh token
  const refreshToken = signToken({ sessionId: session.id }, RefreshTokenSignOptions);

  // only get sidebarCollapsed and locale to sign jwt
  const { sidebarCollapsed, locale, player } = user.toObject().userPreferences;

  // sign user preferences
  const ui_prefs = signToken({ sidebarCollapsed, locale, player }, UserPreferenceSignOptions);

  // return tokens
  return { accessToken, refreshToken, ui_prefs };
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
  const sessionNeedToRefresh = session.expiresAt.getTime() - now.getTime() < oneDay();

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
      userId: session.user,
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
    INVALID_FIREBASE_CREDENTIAL,
    uid
  );

  // if third party not provide email, then return error
  appAssert(
    email,
    BAD_REQUEST,
    "Third-party do not provide email",
    INVALID_FIREBASE_CREDENTIAL,
    uid
  );

  const generatePicture = picture?.replace("s96-c", "s384-c");

  return { email, generatePicture, uid };
};

// login with third-party service
export const loginUserWithThirdParty = async (data: AuthWithThirdPartyServiceRequest) => {
  const { token, sessionInfo } = data;

  // verify firebase access token
  const { email, uid } = await verifyFirebaseAccessToken(token);

  // find user
  const user = await UserModel.findOne({ email: email });

  // if user is not exist
  appAssert(user, NOT_FOUND, "User not found", INVALID_FIREBASE_CREDENTIAL, uid);

  // if those user is exist but not auth for third party
  appAssert(
    user.authForThirdParty,
    FORBIDDEN,
    "This account was registered without using third-party service. Please log in with password to access the account.",
    INVALID_FIREBASE_CREDENTIAL,
    uid
  );

  // if those user is exist and auth for third party
  // then execute login service
  const { accessToken, refreshToken, ui_prefs } = await loginUser({
    email,
    password: "",
    authForThirdParty: true,
    firebaseUID: uid,
    sessionInfo,
  });

  return { accessToken, refreshToken, ui_prefs };
};

// register with third-party service
export const registerUserWithThirdParty = async (data: AuthWithThirdPartyServiceRequest) => {
  const { token, sessionInfo } = data;

  // verify firebase access token
  const { email, generatePicture, uid } = await verifyFirebaseAccessToken(token);

  // register service
  const { user, accessToken, refreshToken, ui_prefs } = await createAccount({
    email,
    password: "",
    profileImage: generatePicture,
    authForThirdParty: true,
    firebaseUID: uid,
    sessionInfo,
  });

  return { user, accessToken, refreshToken, ui_prefs };
};
