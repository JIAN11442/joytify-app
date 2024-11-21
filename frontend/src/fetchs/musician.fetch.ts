import API from "../config/api-client.config";
import { MusicianType } from "../constants/musician-type.constant";

type getMusicianIdsParams = {
  musicians: string[];
  type: MusicianType;
  createIfAbsent?: boolean;
};

// get musician ids
export const getMusicianIds = async (
  data: getMusicianIdsParams
): Promise<string[]> => API.post("/musician/getIds", data);
