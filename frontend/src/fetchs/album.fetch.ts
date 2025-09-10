import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import {
  CreateAlbumRequest,
  AlbumResponse,
  RefactorAlbumResponse,
  UpdateAlbumRequest,
} from "@joytify/types/types";

const { ALBUMS } = API_ENDPOINTS;

// get user albums
export const getUserAlbums = async (): Promise<AlbumResponse[]> => API.get(ALBUMS);

// get target album
export const getAlbumById = async (albumId: string): Promise<RefactorAlbumResponse> =>
  API.get(`${ALBUMS}/${albumId}`);

// get recommended albums
export const getRecommendedAlbums = async (albumId: string): Promise<RefactorAlbumResponse[]> =>
  API.get(`${ALBUMS}/recommendations/${albumId}`);

// create album
export const createAlbum = async (params: CreateAlbumRequest): Promise<AlbumResponse> =>
  API.post(ALBUMS, params);

// update album
export const updateAlbumInfo = async (params: UpdateAlbumRequest): Promise<AlbumResponse> => {
  const { albumId, ...rest } = params;

  return API.patch(`${ALBUMS}/${albumId}`, rest);
};

// remove album
export const removeAlbum = async (albumId: string): Promise<AlbumResponse> =>
  API.patch(`${ALBUMS}/remove/${albumId}`);
