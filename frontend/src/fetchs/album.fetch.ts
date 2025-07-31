import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  CreateAlbumRequest,
  AlbumResponse,
  RefactorAlbumResponse,
} from "@joytify/shared-types/types";

const { ALBUMS } = API_ENDPOINTS;

// get user albums
export const getUserAlbums = async (): Promise<AlbumResponse[]> => API.get(ALBUMS);

// get target album
export const getAlbumById = async (id: string): Promise<RefactorAlbumResponse> =>
  API.get(`${ALBUMS}/${id}`);

// create album
export const createAlbum = async (params: CreateAlbumRequest): Promise<AlbumResponse> =>
  API.post(`${ALBUMS}/create`, params);

// remove album
export const removeAlbum = async (id: string): Promise<AlbumResponse> =>
  API.patch(`${ALBUMS}/remove/${id}`);
