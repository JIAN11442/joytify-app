import { AuthProvider, getIdToken } from "firebase/auth";
import API from "../config/api-client.config";
import { authWithThirdPartyUsingPopup } from "../config/firebase.config";
import { AuthForm } from "../constants/form.constant";
import AuthForOptions, { AuthForType } from "../constants/auth.constant";

// signin with third party axios
type AuthForThirdPartyParams = {
  provider: AuthProvider;
  authFor: AuthForType;
};

// register
export const signup = async (params: AuthForm) =>
  API.post("/auth/register", params);

// login
export const signin = async (params: AuthForm) =>
  API.post("/auth/login", params);

// logout
export const logout = async () => API.get("/auth/logout");

// auth with third party
export const authWithThirdParty = async (params: AuthForThirdPartyParams) => {
  const { provider, authFor } = params;

  return authWithThirdPartyUsingPopup(provider)
    .then(async (user) => {
      if (user) {
        const token = await getIdToken(user);
        const authType =
          authFor === AuthForOptions.SIGN_IN ? "login" : "register";

        return API.post(`/auth/third-party/${authType}`, { token });
      }
    })
    .catch((error) => {
      // throw the error, so mutation can catch it
      throw error;
    });
};
