import API from "../config/api-client.config";
import { CreateAlbumRequest, AlbumResponse } from "@joytify/shared-types/types";

// get user albums
export const getUserAlbums = async (): Promise<AlbumResponse[]> => API.get("/album");

// create album
export const createAlbum = async (params: CreateAlbumRequest): Promise<AlbumResponse> =>
  API.post("/album/create", params);

// remove album
export const removeAlbum = async (id: string): Promise<AlbumResponse> =>
  API.patch(`/album/remove/${id}`);

// delete album(*)
export const deleteAlbum = async (id: string): Promise<AlbumResponse> =>
  API.delete(`/album/delete/${id}`);
