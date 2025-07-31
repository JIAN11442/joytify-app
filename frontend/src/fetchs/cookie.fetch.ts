import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  UpdateUserPreferencesCookieRequest,
  VerifiedUserPreferencesCookieResponse,
} from "@joytify/shared-types/types";

const { COOKIE } = API_ENDPOINTS;

export const getUserPreferencesCookie =
  async (): Promise<VerifiedUserPreferencesCookieResponse | null> =>
    API.get(`${COOKIE}/preferences`);

export const updateUserPreferencesCookie = async (params: UpdateUserPreferencesCookieRequest) =>
  API.patch(`${COOKIE}/preferences`, params);
