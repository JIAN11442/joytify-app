import { getIdToken, AuthProvider } from "firebase/auth";

import { AuthForOptions } from "@joytify/shared-types/constants";
import {
  RegisterRequest,
  LoginRequest,
  AuthForType,
  SessionInfo,
} from "@joytify/shared-types/types";
import { authWithThirdPartyUsingPopup } from "../config/firebase.config";
import API from "../config/api-client.config";

type AuthWithThirdPartyParams = {
  provider: AuthProvider;
  authFor: AuthForType;
  sessionInfo: SessionInfo;
};

// register
export const signup = async (params: RegisterRequest) => API.post("/auth/register", params);

// login
export const signin = async (params: LoginRequest) => API.post("/auth/login", params);

// auth with third party
export const authWithThirdParty = async (params: AuthWithThirdPartyParams) => {
  const { provider, authFor, sessionInfo } = params;
  const { SIGN_IN } = AuthForOptions;

  return authWithThirdPartyUsingPopup(provider)
    .then(async (user) => {
      if (user) {
        const token = await getIdToken(user);
        const authType = authFor === SIGN_IN ? "login" : "register";

        return API.post(`/auth/third-party/${authType}`, { token, sessionInfo });
      }
    })
    .catch((error) => {
      // throw the error, so mutation can catch it
      throw error;
    });
};

// logout
export const logout = async () => API.get("/auth/logout");
