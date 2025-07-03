import API from "../config/api-client.config";
import {
  GetMusicianIdRequest,
  MusicianResponse,
  RefactorMusicianResponse,
} from "@joytify/shared-types/types";

// get musician id
export const getMusicianId = async (params: GetMusicianIdRequest): Promise<string> =>
  API.post("/musician/getId", params);

export const getMusicianById = async (id: string): Promise<RefactorMusicianResponse> =>
  API.get(`/musician/${id}`);

export const getFollowingMusicians = async (): Promise<MusicianResponse[]> =>
  API.get("/musician/following");

export const followMusician = async (musicianId: string): Promise<MusicianResponse> =>
  API.patch(`/musician/follow/${musicianId}`);

export const unfollowMusician = async (musicianId: string): Promise<MusicianResponse> =>
  API.patch(`/musician/unfollow/${musicianId}`);
