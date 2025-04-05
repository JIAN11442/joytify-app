import API from "../config/api-client.config";
import {
  UpdateUserPreferencesCookieRequest,
  VerifiedUserPreferencesCookieResponse,
} from "@joytify/shared-types/types";

export const getUserPreferencesCookie =
  async (): Promise<VerifiedUserPreferencesCookieResponse | null> =>
    API.get("/cookie/get-user-preferences");

export const updateUserPreferencesCookie = async (params: UpdateUserPreferencesCookieRequest) =>
  API.post("/cookie/update-user-preferences", params);
