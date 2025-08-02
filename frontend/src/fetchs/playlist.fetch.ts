import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/shared-types/constants";
import {
  UpdatePlaylistRequest,
  DeletePlaylistRequest,
  CreatePlaylistRequest,
  PlaylistResponse,
  RefactorPlaylistResponse,
} from "@joytify/shared-types/types";

const { PLAYLISTS } = API_ENDPOINTS;

// get all user playlists
export const getPlaylists = async (query?: string): Promise<PlaylistResponse[]> =>
  API.get(PLAYLISTS, { params: { search: query } });

// get playlist by id
export const getPlaylistById = async (playlistId: string): Promise<RefactorPlaylistResponse> =>
  API.get(`${PLAYLISTS}/${playlistId}`);

// create playlist
export const createPlaylist = async (params: CreatePlaylistRequest): Promise<PlaylistResponse> =>
  API.post(PLAYLISTS, params);

// update playlist cover image
export const updatePlaylist = async (params: UpdatePlaylistRequest): Promise<PlaylistResponse> => {
  const { playlistId, ...rest } = params;

  return API.patch(`${PLAYLISTS}/${playlistId}`, rest);
};

// delete playlist
export const deletePlaylist = async (params: DeletePlaylistRequest): Promise<PlaylistResponse> => {
  const { currentPlaylistId, targetPlaylistId } = params;

  return API.delete(`${PLAYLISTS}/${currentPlaylistId}`, {
    data: { targetPlaylistId },
  });
};
