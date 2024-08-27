import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { SessionDocument } from "../models/session.model";
import { UserDocument } from "../models/user.model";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} from "../constants/env-validate.constant";

// default options type
const defaults: SignOptions = {
  audience: ["user"],
};

// custom options type
type SignOptionsAndSecret = SignOptions & { secret: string };
type VerifyOptionsAndSecret = VerifyOptions & { secret: string };

// Payload
export interface RefreshTokenPayload {
  sessionId: SessionDocument["_id"];
}

export interface AccessTokenPayload extends RefreshTokenPayload {
  userId: UserDocument["_id"];
  firebaseUserId: string;
}

// Options
export const AccessTokenSignOptions: SignOptionsAndSecret = {
  ...defaults,
  expiresIn: "15m",
  secret: ACCESS_SECRET_KEY,
};

export const RefreshTokenSignOptions: SignOptionsAndSecret = {
  ...defaults,
  expiresIn: "30d",
  secret: REFRESH_SECRET_KEY,
};

// sign token
export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options: SignOptionsAndSecret
) => {
  const { secret, ...signOpts } = options;

  return jwt.sign(payload, secret, signOpts);
};

// verify token
export const verifyToken = async <TPayload extends object = AccessTokenPayload>(
  token: string,
  options: VerifyOptionsAndSecret
) => {
  try {
    const { secret = ACCESS_SECRET_KEY, ...verifyOpts } = options;

    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as TPayload;

    return { payload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
