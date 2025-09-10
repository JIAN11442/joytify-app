import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import {
  LabelOptionsType,
  PaginatedAlbumResponse,
  PaginatedLabelResponse,
  PaginatedMusicianResponse,
  PaginatedSongsResponse,
} from "@joytify/types/types";

const { HOMEPAGE } = API_ENDPOINTS;

export const getPopularMusicians = async (page: number): Promise<PaginatedMusicianResponse> =>
  API.get(`${HOMEPAGE}/musicians/popular/${page}`);

export const getRecentlyPlayedSongs = async (page: number): Promise<PaginatedSongsResponse> =>
  API.get(`${HOMEPAGE}/songs/recently/${page}`);

export const getHomepageRecommendedLabels = async (
  type: LabelOptionsType,
  page: number
): Promise<PaginatedLabelResponse> => API.get(`${HOMEPAGE}/labels/recommendations/${type}/${page}`);

export const getHomepageRecommendedSongs = async (
  page: number,
  songIds?: string[]
): Promise<PaginatedSongsResponse> =>
  API.post(`${HOMEPAGE}/songs/recommendations/${page}`, { songIds });

export const getHomepageRecommendedAlbums = async (
  page: number,
  songIds?: string[]
): Promise<PaginatedAlbumResponse> =>
  API.post(`${HOMEPAGE}/albums/recommendations/${page}`, { songIds });
