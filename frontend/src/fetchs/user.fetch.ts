import API from "../config/api-client.config";
import { ResUser } from "../constants/axios-response.constant";

type ResetUserPasswordParams = {
  token: string;
  currentPassword: string;
  newPassword: string;
};

// get user
export const getUserInfo = async (): Promise<ResUser> => API.get("/user");

// deregister user account
export const deregisterUserAccount = async () => API.delete("/user/deregister");

// reset user password
export const resetUserPassword = async (params: ResetUserPasswordParams) => {
  const { token, ...rest } = params;

  return API.post(`/user/password/reset/${token}`, rest);
};
