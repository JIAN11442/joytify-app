import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  GetMusicianIdRequest,
  MusicianResponse,
  RefactorMusicianResponse,
  UpdateMusicianRequest,
} from "@joytify/shared-types/types";

const { MUSICIANS } = API_ENDPOINTS;

// get musician id
export const getMusicianId = async (params: GetMusicianIdRequest): Promise<string> =>
  API.get(`${MUSICIANS}/getId`, { params });

export const getMusicianById = async (musicianId: string): Promise<RefactorMusicianResponse> =>
  API.get(`${MUSICIANS}/${musicianId}`);

export const getFollowingMusicians = async (): Promise<MusicianResponse[]> =>
  API.get(`${MUSICIANS}/following`);

export const getRecommendedMusicians = async (
  musicianId: string
): Promise<RefactorMusicianResponse[]> => API.get(`${MUSICIANS}/recommendations/${musicianId}`);

export const updateMusicianInfo = async (
  params: UpdateMusicianRequest
): Promise<MusicianResponse> => {
  const { musicianId, ...rest } = params;

  return API.patch(`${MUSICIANS}/${musicianId}`, rest);
};

export const followMusician = async (musicianId: string): Promise<MusicianResponse> =>
  API.patch(`${MUSICIANS}/follow/${musicianId}`);

export const unfollowMusician = async (musicianId: string): Promise<MusicianResponse> =>
  API.patch(`${MUSICIANS}/unfollow/${musicianId}`);
