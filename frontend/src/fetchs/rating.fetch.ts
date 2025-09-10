import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import { UpsertSongRatingRequet, RatingResponse, SongResponse } from "@joytify/types/types";

const { RATINGS } = API_ENDPOINTS;

export const getUserSongRating = (songId: string): Promise<RatingResponse> =>
  API.get(`${RATINGS}/${songId}`);

export const rateSong = (params: UpsertSongRatingRequet): Promise<SongResponse> =>
  API.post(`${RATINGS}/song`, params);
