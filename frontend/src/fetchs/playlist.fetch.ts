import API from "../config/api-client.config";
import { resPlaylist } from "../constants/axios-response.constant";

type updatePlaylistParams = {
  playlistId: string;
  title?: string;
  description?: string;
  awsImageUrl?: string;
};

type deletePlaylistParams = {
  currentPlaylistId: string;
  targetPlaylistId?: string;
};

type changePlaylistHiddenStateParams = {
  playlistId: string;
  hiddenState: boolean;
};

// get all user playlists
export const getPlaylists = async (
  query: string | null
): Promise<resPlaylist[]> => API.get(`/playlist/search/${query}`);

// get playlist by id
export const getPlaylistById = async (id: string): Promise<resPlaylist> =>
  API.get(`/playlist/${id}`);

// create playlist
export const createPlaylist = async (
  title: string | null
): Promise<resPlaylist> =>
  API.post("/playlist/create", { ...(title ? { title } : {}) });

// update playlist cover image
export const updatePlaylist = async (
  data: updatePlaylistParams
): Promise<resPlaylist> => {
  const { awsImageUrl, playlistId, ...params } = data;

  return API.patch(`/playlist/update/${playlistId}`, {
    ...params,
    imageUrl: awsImageUrl,
  });
};

// delete playlist
export const deletePlaylist = async (
  data: deletePlaylistParams
): Promise<resPlaylist> => {
  const { currentPlaylistId, targetPlaylistId } = data;

  return API.delete(`/playlist/delete/${currentPlaylistId}`, {
    data: { targetPlaylistId },
  });
};

// change playlist hidden state from user playlists list
export const changePlaylistHiddenState = async ({
  playlistId,
  hiddenState,
}: changePlaylistHiddenStateParams): Promise<resPlaylist> =>
  API.patch(`/playlist/change-hidden-state/${playlistId}`, { hiddenState });
