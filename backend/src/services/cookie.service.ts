import _ from "lodash";

import { HttpCode } from "@joytify/shared-types/constants";
import {
  UpdateUserPreferencesCookieRequest,
  UserPreferencesCookieParams,
} from "@joytify/shared-types/types";
import { signToken, UserPreferenceSignOptions, verifyToken } from "../utils/jwt.util";
import appAssert from "../utils/app-assert.util";

const { UNAUTHORIZED } = HttpCode;

type GetVerifiedPrefsCookieServiceRequest = {
  cookie: string;
  strict?: boolean;
};

type UpdatePrefsCookieServiceRequest = {
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

  const { payload } = await verifyToken(cookie, {
    secret: UserPreferenceSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "User preferences cookie is invalid");

  return { payload };
};

// update user preferences cookie
export const updateUserPreferencesCookie = async (params: UpdatePrefsCookieServiceRequest) => {
  const { cookie, updatePayload } = params;
  const { payload } = await getVerifiedUserPreferencesCookie({ cookie, strict: true });
  const currentPayload = _.omit(payload, ["iat", "exp", "aud"]);
  const mergedPayload = { ...currentPayload, ...updatePayload } as UserPreferencesCookieParams;

  const newCookie = signToken(mergedPayload, UserPreferenceSignOptions);

  return { newCookie };
};
