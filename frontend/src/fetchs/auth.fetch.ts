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
export const signup = async (data: AuthForm) =>
  API.post("/auth/register", data);

// login
export const signin = async (data: AuthForm) => API.post("/auth/login", data);

// logout
export const logout = async () => API.get("/auth/logout");

// auth with third party
export const authWithThirdParty = async (data: AuthForThirdPartyParams) => {
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
