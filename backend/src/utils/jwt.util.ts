import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { UserDocument } from "../models/user.model";
import { SessionDocument } from "../models/session.model";
import {
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  USER_PREFERENCE_SECRET_KEY,
  VERIFICATION_SECRET_KEY,
} from "../constants/env-validate.constant";
import {
  LoopModeType,
  AudioVolumeType,
  SupportedLocaleType,
  PlaybackQueueWithIds,
} from "@joytify/shared-types/types";

// ===================== Defaults =====================

const defaults: SignOptions = {
  audience: ["user"],
};

// ===================== Types =====================

type SignOptionsAndSecret = SignOptions & { secret: string };
type VerifyOptionsAndSecret = VerifyOptions & { secret: string };

type TokenPayload =
  | AccessTokenPayload
  | RefreshTokenPayload
  | VerificationTokenPayload
  | UserPreferenceTokenPayload;

// ===================== Payload =====================

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

export interface AccessTokenPayload extends RefreshTokenPayload {
  userId: UserDocument["_id"];
  firebaseUserId: string;
}

export type VerificationTokenPayload = {
  sessionId: string;
};

export type UserPreferenceTokenPayload = {
  sidebarCollapsed: boolean;
  locale: SupportedLocaleType;
  player: {
    shuffle: boolean;
    loop: LoopModeType;
    volume: AudioVolumeType;
    playbackQueue: PlaybackQueueWithIds;
  };
};

// ===================== Options =====================
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

export const VerificationTokenSignOptions: SignOptionsAndSecret = {
  ...defaults,
  expiresIn: "10m",
  secret: VERIFICATION_SECRET_KEY,
};

export const UserPreferenceSignOptions: SignOptionsAndSecret = {
  ...defaults,
  expiresIn: "30d",
  secret: USER_PREFERENCE_SECRET_KEY,
};

// ===================== Sign and Verify =====================
export const signToken = (payload: TokenPayload, options: SignOptionsAndSecret) => {
  const { secret, ...signOpts } = options;

  return jwt.sign(payload, secret, signOpts);
};

export const verifyToken = async <TPayload extends object = AccessTokenPayload>(
  token: string | undefined,
  options: VerifyOptionsAndSecret
) => {
  try {
    let payload;
    const { secret = ACCESS_SECRET_KEY, ...verifyOpts } = options;

    if (token) {
      payload = jwt.verify(token, secret, {
        ...defaults,
        ...verifyOpts,
      }) as TPayload;
    }

    return { payload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
