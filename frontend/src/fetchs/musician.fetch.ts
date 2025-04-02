import API from "../config/api-client.config";
import { GetMusicianIdRequest } from "@joytify/shared-types/types";

// get musician id
export const getMusicianId = async (params: GetMusicianIdRequest): Promise<string> =>
  API.post("/musician/getId", params);
