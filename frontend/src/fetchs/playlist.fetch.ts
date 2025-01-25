import API from "../config/api-client.config";
import { ResPlaylist } from "../constants/axios-response.constant";

type UpdatePlaylistParams = {
  playlistId: string;
  title?: string;
  description?: string;
  awsImageUrl?: string;
};

type DeletePlaylistParams = {
  currentPlaylistId: string;
  targetPlaylistId?: string;
};

type ChangePlaylistHiddenStateParams = {
  playlistId: string;
  hiddenState: boolean;
};

// get all user playlists
export const getPlaylists = async (
  query: string | null
): Promise<ResPlaylist[]> => API.get(`/playlist/search/${query}`);

// get playlist by id
export const getPlaylistById = async (id: string): Promise<ResPlaylist> =>
  API.get(`/playlist/${id}`);

// create playlist
export const createPlaylist = async (
  title: string | null
): Promise<ResPlaylist> =>
  API.post("/playlist/create", { ...(title ? { title } : {}) });

// update playlist cover image
export const updatePlaylist = async (
  data: UpdatePlaylistParams
): Promise<ResPlaylist> => {
  const { awsImageUrl, playlistId, ...params } = data;

  return API.patch(`/playlist/update/${playlistId}`, {
    ...params,
    imageUrl: awsImageUrl,
  });
};

// delete playlist
export const deletePlaylist = async (
  data: DeletePlaylistParams
): Promise<ResPlaylist> => {
  const { currentPlaylistId, targetPlaylistId } = data;

  return API.delete(`/playlist/delete/${currentPlaylistId}`, {
    data: { targetPlaylistId },
  });
};

// change playlist hidden state from user playlists list
export const changePlaylistHiddenState = async ({
  playlistId,
  hiddenState,
}: ChangePlaylistHiddenStateParams): Promise<ResPlaylist> =>
  API.patch(`/playlist/change-hidden-state/${playlistId}`, { hiddenState });
