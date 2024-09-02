import API from "../config/api-client.config";
import { resPlaylist } from "../constants/data-type.constant";

// get all user playlists
export const getAllPlaylists = async (): Promise<resPlaylist[]> =>
  API.get("/playlist");

// get playlist by id
export const getPlaylistById = async (id: string): Promise<resPlaylist> =>
  API.get(`/playlist/${id}`);

// create playlist
export const createPlaylist = async (): Promise<resPlaylist> =>
  API.post("/playlist/create");
