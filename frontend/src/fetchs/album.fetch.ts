import API from "../config/api-client.config";
import {
  CreateAlbumRequest,
  AlbumResponse,
  RefactorAlbumResponse,
} from "@joytify/shared-types/types";

// get user albums
export const getUserAlbums = async (): Promise<AlbumResponse[]> => API.get("/album");

// get target album
export const getAlbumById = async (id: string): Promise<RefactorAlbumResponse> =>
  API.get(`/album/${id}`);

// create album
export const createAlbum = async (params: CreateAlbumRequest): Promise<AlbumResponse> =>
  API.post("/album/create", params);

// remove album
export const removeAlbum = async (id: string): Promise<AlbumResponse> =>
  API.patch(`/album/remove/${id}`);

// delete album(*)
export const deleteAlbum = async (id: string): Promise<AlbumResponse> =>
  API.delete(`/album/delete/${id}`);
