import API from "../config/api-client.config";
import { resAlbum } from "../constants/axios-response.constant";

type CreateAlbumType = {
  title: string;
  description?: string;
  cover_image?: string;
  artist?: string;
};

// get user albums
export const getUserAlbums = async (): Promise<resAlbum[]> => API.get("/album");

// create album
export const createAlbum = async (data: CreateAlbumType): Promise<resAlbum> =>
  API.post("/album/create", data);

// delete album
export const removeAlbum = async (id: string): Promise<resAlbum> =>
  API.delete(`/album/delete/${id}`);
