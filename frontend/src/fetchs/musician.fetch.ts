import API from "../config/api-client.config";
import { MusicianType } from "../constants/musician.constant";

type GetMusicianIdsParams = {
  musicians: string[];
  type: MusicianType;
  createIfAbsent?: boolean;
};

// get musician ids
export const getMusicianIds = async (
  data: GetMusicianIdsParams
): Promise<string[]> => API.post("/musician/getIds", data);
