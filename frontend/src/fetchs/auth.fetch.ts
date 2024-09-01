import { AuthProvider, getIdToken } from "firebase/auth";
import API from "../config/api-client.config";
import { DefaultsAuthType } from "../constants/form-default-data.constant";
import { authWithThirdPartyUsingPopup } from "../config/firebase.config";
import AuthForOptions, { AuthForType } from "../constants/auth-type.constant";

// login axios
export const signin = async (data: DefaultsAuthType) =>
  API.post("/auth/login", data);

// register axios
export const signup = async (data: DefaultsAuthType) =>
  API.post("/auth/register", data);

// logout axios
export const logout = async () => API.get("/auth/logout");

// signin with third party axios
type authForThirdPartyParams = {
  provider: AuthProvider;
  authFor: AuthForType;
};

export const authWithThirdParty = async (data: authForThirdPartyParams) => {
  const { provider, authFor } = data;

  return authWithThirdPartyUsingPopup(provider)
    .then(async (user) => {
      if (user) {
        const token = await getIdToken(user);
        const params =
          authFor === AuthForOptions.SIGN_IN ? "login" : "register";

        return API.post(`/auth/third-party/${params}`, { token });
      }
    })
    .catch((error) => {
      // throw the error, so mutation can catch it
      throw error;
    });
};

// send reset password verification email
export const sendResetPasswordEmail = async (email: string) =>
  API.post("/auth/password/forgot", { email });
