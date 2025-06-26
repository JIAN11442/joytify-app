import API from "../config/api-client.config";
import {
  PlaylistResponse,
  RefactorPlaylistResponse,
  UpdatePlaylistRequest,
  DeletePlaylistRequest,
  CreatePlaylistRequest,
} from "@joytify/shared-types/types";

// get all user playlists
export const getPlaylists = async (query?: string): Promise<PlaylistResponse[]> =>
  API.get("/playlist", { params: { search: query } });

// get playlist by id
export const getPlaylistById = async (id: string): Promise<RefactorPlaylistResponse> =>
  API.get(`/playlist/${id}`);

// create playlist
export const createPlaylist = async (params: CreatePlaylistRequest): Promise<PlaylistResponse> =>
  API.post("/playlist/create", { ...params });

// update playlist cover image
export const updatePlaylist = async (params: UpdatePlaylistRequest): Promise<PlaylistResponse> => {
  const { playlistId, ...rest } = params;

  return API.patch(`/playlist/update/${playlistId}`, { ...rest });
};

// delete playlist
export const deletePlaylist = async (params: DeletePlaylistRequest): Promise<PlaylistResponse> => {
  const { currentPlaylistId, targetPlaylistId } = params;

  return API.delete(`/playlist/delete/${currentPlaylistId}`, {
    data: { targetPlaylistId },
  });
};
