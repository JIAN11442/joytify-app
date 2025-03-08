import API from "../config/api-client.config";

type StorePlaybackLogParams = {
  songId: string;
  duration: number;
  state: string;
  timestamp: Date;
};

// store playback log
export const storePlaybackLog = async (params: StorePlaybackLogParams) =>
  API.post("/playback/record", params);
