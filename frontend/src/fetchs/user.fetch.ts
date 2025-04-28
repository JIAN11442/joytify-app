import API from "../config/api-client.config";
import {
  UpdateUserInfoRequest,
  ResetPasswordRequest,
  ProfileCollectionInfoRequest,
  UserResponse,
  AuthUserResponse,
  RefactorProfileUserResponse,
  ProfileCollectionInfoResponse,
  ChangePasswordRequest,
  DeregisterUserAccountRequest,
} from "@joytify/shared-types/types";
import { getLabelId } from "./label.fetch";
import { LabelOptions } from "@joytify/shared-types/constants";

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
export const updateUserInfo = async (params: UpdateUserInfoRequest): Promise<UserResponse> => {
  const payload = { ...params };

  // if country is provided, get the id
  if (payload.country && payload.country?.length > 0) {
    try {
      payload.country = await getLabelId({
        label: payload.country,
        type: LabelOptions.COUNTRY,
        default: true,
        createIfAbsent: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return API.patch("/user/update", payload);
};

// reset user password
export const resetUserPassword = async (params: ResetPasswordRequest) => {
  const { token, ...rest } = params;

  return API.patch(`/user/password/reset/${token}`, rest);
};

// change user password
export const changeUserPassword = async (params: ChangePasswordRequest) =>
  API.patch(`/user/password/change`, params);

// deregister user account
export const deregisterUserAccount = async (params: DeregisterUserAccountRequest) =>
  API.delete("/user/deregister", { data: params });
