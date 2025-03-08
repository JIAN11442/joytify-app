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
  params: UpdatePlaylistParams
): Promise<ResPlaylist> => {
  const { awsImageUrl, playlistId, ...rest } = params;

  return API.patch(`/playlist/update/${playlistId}`, {
    ...rest,
    imageUrl: awsImageUrl,
  });
};

// delete playlist
export const deletePlaylist = async (
  params: DeletePlaylistParams
): Promise<ResPlaylist> => {
  const { currentPlaylistId, targetPlaylistId } = params;

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
