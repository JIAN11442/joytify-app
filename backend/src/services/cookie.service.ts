import _ from "lodash";

import UserModel from "../models/user.model";
import { HttpCode } from "@joytify/types/constants";
import { UpdateUserPreferencesCookieRequest } from "@joytify/types/types";
import {
  signToken,
  UserPreferenceSignOptions,
  verifyToken,
  UserPreferenceTokenPayload,
} from "../utils/jwt.util";
import appAssert from "../utils/app-assert.util";

const { UNAUTHORIZED, NOT_FOUND } = HttpCode;

type GetVerifiedPrefsCookieServiceRequest = {
  cookie: string;
  strict?: boolean;
};

type UpdatePrefsCookieServiceRequest = {
  userId: string;
  cookie: string;
  updatePayload: UpdateUserPreferencesCookieRequest;
};

// get verified user preferences cookie
export const getVerifiedUserPreferencesCookie = async (
  params: GetVerifiedPrefsCookieServiceRequest
) => {
  const { cookie, strict = false } = params;

  // if cookie is not provided,
  //  strict is true, throw an error
  //  strict is false, return null directly
  if (!cookie) {
    if (strict) {
      appAssert(cookie, UNAUTHORIZED, "User preferences cookie not found");
    }

    return { payload: null };
  }

  const { payload } = await verifyToken<UserPreferenceTokenPayload>(cookie, {
    secret: UserPreferenceSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "User preferences cookie is invalid");

  return { payload };
};

// update user preferences cookie
export const updateUserPreferencesCookie = async (params: UpdatePrefsCookieServiceRequest) => {
  const { userId, cookie, updatePayload } = params;

  const { payload } = await getVerifiedUserPreferencesCookie({ cookie, strict: true });

  const currentPayload = _.omit(payload, ["iat", "exp", "aud"]) as UserPreferenceTokenPayload;
  const mergedPayload = { ...currentPayload, ...updatePayload } as UserPreferenceTokenPayload;

  // sign new jwt token
  const newCookie = signToken(mergedPayload, UserPreferenceSignOptions);

  // update user preferences
  const updatedUserPreferences = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: Object.entries(updatePayload).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`userPreferences.${key}`]: value,
        }),
        {}
      ),
    },
    { new: true }
  );

  appAssert(updatedUserPreferences, NOT_FOUND, "User not found");

  return { newCookie };
};
