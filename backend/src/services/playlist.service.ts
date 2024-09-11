import { FilterQuery } from "mongoose";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import usePalette from "../hooks/paletee.hook";

// get user all playlist service
export const getUserPlaylist = async (
  userId: string,
  searchParams: string | null
) => {
  let defaultQueryParams: FilterQuery<PlaylistDocument> = {
    userId,
    default: true,
  };
  let userQueryParams: FilterQuery<PlaylistDocument> = {
    userId,
    default: false,
  };

  if (searchParams !== null && searchParams?.length) {
    const titleRegex = new RegExp(searchParams, "i");
    defaultQueryParams.title = titleRegex;
    userQueryParams.title = titleRegex;
  }

  const defaultPlaylist = await PlaylistModel.findOne(defaultQueryParams);

  const userPlaylists = await PlaylistModel.find(userQueryParams).sort({
    createdAt: -1,
  });

  const playlists = [
    ...(defaultPlaylist ? [defaultPlaylist] : []),
    ...userPlaylists,
  ].filter(Boolean);

  return { playlists };
};

// get playlist by id service
export const getUserPlaylistById = async (
  playlistId: string,
  userId: string
) => {
  const playlist = await PlaylistModel.findOne({
    _id: playlistId,
    userId,
  }).populate("songs");

  appAssert(playlist, NOT_FOUND, "Playlist not found");

  // get paletee from cover image
  const paletee = await usePalette(playlist.cover_image);

  const newPlaylist = { ...playlist.toObject(), paletee };

  return { playlist: newPlaylist };
};

// create new playlist service
export const createNewPlaylist = async (userId: string) => {
  const playlist = await PlaylistModel.create({ userId });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};

// update playlist cover image service
type updatePlaylistType = {
  playlistId: string;
  userId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
};

export const updatePlaylistById = async ({
  playlistId,
  userId,
  title,
  description,
  imageUrl,
}: updatePlaylistType) => {
  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    {
      _id: playlistId,
      userId,
    },
    { title, description, cover_image: imageUrl },
    { new: true }
  );

  appAssert(
    updatedPlaylist,
    INTERNAL_SERVER_ERROR,
    "Failed to update playlist"
  );

  return { playlist: updatedPlaylist };
};
