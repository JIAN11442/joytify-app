import API from "../config/api-client.config";
import { StorePlaybackLogRequest, PlaybackLogResponse } from "@joytify/shared-types/types";

// store playback log
export const storePlaybackLog = async (
  params: StorePlaybackLogRequest
): Promise<PlaybackLogResponse> => API.post("/playback/record", params);
