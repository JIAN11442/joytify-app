import PlaylistModel from "../models/playlist.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";

// get user all playlist service
export const getUserPlaylist = async (userId: string) => {
  const defaultPlaylist = await PlaylistModel.findOne({
    userId,
    default: true,
  });

  const userPlaylists = await PlaylistModel.find({
    userId,
    default: false,
  }).sort({
    createdAt: -1,
  });

  const playlists = [defaultPlaylist, ...userPlaylists];

  return { playlists };
};

// get playlist by id service
export const getUserPlaylistById = async (
  playlistId: string,
  userId: string
) => {
  const playlist = await PlaylistModel.findOne({ _id: playlistId, userId });

  appAssert(playlist, NOT_FOUND, "Playlist not found");

  return { playlist };
};

// create new playlist service
export const createNewPlaylist = async (userId: string) => {
  const playlist = await PlaylistModel.create({ userId });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};
