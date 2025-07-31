import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import { CreatePlaybackLogRequest, PlaybackLogResponse } from "@joytify/shared-types/types";

const { PLAYBACK } = API_ENDPOINTS;

// create playback log
export const createPlaybackLog = async (
  params: CreatePlaybackLogRequest
): Promise<PlaybackLogResponse> => API.post(PLAYBACK, params);
