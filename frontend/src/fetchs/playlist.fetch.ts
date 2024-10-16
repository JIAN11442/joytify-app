import API from "../config/api-client.config";
import { resPlaylist } from "../constants/data-type.constant";

// get all user playlists
export const getPlaylists = async (
  query: string | null
): Promise<resPlaylist[]> => API.get(`/playlist/search/${query}`);

// get playlist by id
export const getPlaylistById = async (id: string): Promise<resPlaylist> =>
  API.get(`/playlist/${id}`);

// create playlist
export const createPlaylist = async (): Promise<resPlaylist> =>
  API.post("/playlist/create");

// update playlist cover image
type updatePlaylistParams = {
  playlistId: string;
  title?: string;
  description?: string;
  awsImageUrl?: string;
};

export const updatePlaylist = async (
  data: updatePlaylistParams
): Promise<resPlaylist> => {
  const { awsImageUrl, playlistId, ...params } = data;

  return API.patch(`/playlist/update/${playlistId}`, {
    ...params,
    imageUrl: awsImageUrl,
  });
};

type deletePlaylistParams = {
  currentPlaylistId: string;
  targetPlaylistId: string;
};

// delete playlist
export const deletePlaylist = async (data: deletePlaylistParams) => {
  const { currentPlaylistId, targetPlaylistId } = data;

  return API.delete(
    `/playlist/delete/${currentPlaylistId}?target=${targetPlaylistId}`
  );
};

// change playlist hidden state from user playlists list
type changePlaylistHiddenStateParams = {
  playlistId: string;
  hiddenState: boolean;
};

export const changePlaylistHiddenState = async ({
  playlistId,
  hiddenState,
}: changePlaylistHiddenStateParams) =>
  API.patch(`/playlist/change-hidden-state/${playlistId}`, { hiddenState });
