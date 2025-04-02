import API from "../config/api-client.config";
import {
  UpdateUserInfoRequest,
  ResetPasswordRequest,
  ProfileCollectionInfoRequest,
  UserResponse,
  AuthUserResponse,
  RefactorProfileUserResponse,
  ProfileCollectionInfoResponse,
} from "@joytify/shared-types/types";

// get authenticated user info
export const getAuthUserInfo = async (): Promise<AuthUserResponse> =>
  API.get("/user/authenticated");

// get profile user info
export const getProfileUserInfo = async (page: number): Promise<RefactorProfileUserResponse> =>
  API.get("/user/profile", { params: { page } });

// get profile collection docs info
export const getProfileCollectionInfo = async (
  params: ProfileCollectionInfoRequest
): Promise<ProfileCollectionInfoResponse> => {
  const { page, collection } = params;

  return API.get(`/user/profile/${collection}`, { params: { page } });
};

// update user info
export const updateUserInfo = async (params: UpdateUserInfoRequest): Promise<UserResponse> =>
  API.patch("/user/update", params);

// reset user password
export const resetUserPassword = async (params: ResetPasswordRequest): Promise<UserResponse> => {
  const { token, ...rest } = params;

  return API.post(`/user/password/reset/${token}`, rest);
};

// deregister user account
export const deregisterUserAccount = async () => API.delete("/user/deregister");
