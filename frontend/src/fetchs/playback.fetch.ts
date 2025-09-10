import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import { CreatePlaybackLogRequest, PlaybackLogResponse } from "@joytify/types/types";

const { PLAYBACK } = API_ENDPOINTS;
const MIN_PLAYBACK_DURATION = import.meta.env.VITE_MIN_PLAYBACK_DURATION;

// create playback log
export const createPlaybackLog = async (
  params: CreatePlaybackLogRequest
): Promise<PlaybackLogResponse | null> => {
  const { duration } = params;

  // skip if duration is less than minimum playback duration
  if (duration < MIN_PLAYBACK_DURATION) {
    return null;
  }

  return API.post(PLAYBACK, params);
};
