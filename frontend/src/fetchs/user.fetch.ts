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
import { LabelOptions, API_ENDPOINTS } from "@joytify/shared-types/constants";

const { USERS } = API_ENDPOINTS;

// get authenticated user info
export const getAuthUserInfo = async (): Promise<AuthUserResponse> =>
  API.get(`${USERS}/authenticated`);

// get profile user info
export const getProfileUserInfo = async (page: number): Promise<RefactorProfileUserResponse> =>
  API.get(`${USERS}/profile`, { params: { page } });

// get profile collection docs info
export const getProfileCollectionInfo = async (
  params: ProfileCollectionInfoRequest
): Promise<ProfileCollectionInfoResponse> => {
  const { page, collection } = params;

  return API.get(`${USERS}/profile/${collection}`, { params: { page } });
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

  return API.patch(`${USERS}`, payload);
};

// reset user password
export const resetUserPassword = async (params: ResetPasswordRequest) => {
  const { token, ...rest } = params;

  return API.patch(`${USERS}/password/reset/${token}`, rest);
};

// change user password
export const changeUserPassword = async (params: ChangePasswordRequest) =>
  API.patch(`${USERS}/password/change`, params);

// deregister user account
export const deregisterUserAccount = async (params: DeregisterUserAccountRequest) =>
  API.delete(`${USERS}/deregister`, { data: params });
