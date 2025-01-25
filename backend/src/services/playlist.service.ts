import { FilterQuery } from "mongoose";

import SongModel from "../models/song.model";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";

type CreatePlaylistParams = {
  userId: string;
  title?: string;
};

interface UpdatePlaylistParams extends CreatePlaylistParams {
  playlistId: string;
  description?: string;
  imageUrl?: string;
}

type DeletePlaylistParams = {
  userId: string;
  currentPlaylistId: string;
  targetPlaylistId?: string;
};

// get user all playlist service
export const getUserPlaylists = async (
  userId: string,
  searchParams: string | null
) => {
  let defaultQueryParams: FilterQuery<PlaylistDocument> = {
    user: userId,
    default: true,
  };
  let userQueryParams: FilterQuery<PlaylistDocument> = {
    user: userId,
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
  // get playlist info
  let playlist = await PlaylistModel.findOne({
    _id: playlistId,
    user: userId,
  }).populate({
    path: "songs",
    populate: [
      { path: "artist", select: "name" },
      { path: "composers", select: "name" },
      { path: "lyricists", select: "name" },
      { path: "languages", select: "label" },
      { path: "album", select: "title" },
    ],
  });

  appAssert(playlist, NOT_FOUND, "Playlist not found");

  return { playlist };
};

// create new playlist service
export const createNewPlaylist = async (data: CreatePlaylistParams) => {
  const { userId, title } = data;

  const playlist = await PlaylistModel.create({ user: userId, title });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};

// update playlist cover image service
export const updatePlaylistById = async (data: UpdatePlaylistParams) => {
  const { playlistId, userId, title, description, imageUrl } = data;

  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    { _id: playlistId, user: userId },
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

// delete playlist service
export const deletePlaylistById = async (data: DeletePlaylistParams) => {
  const { userId, currentPlaylistId, targetPlaylistId } = data;

  // find the playlist to be deleted
  const playlist = await PlaylistModel.findById(currentPlaylistId);

  appAssert(playlist, NOT_FOUND, "The playlist is not found");

  // if have target playlist ID
  if (targetPlaylistId) {
    const [updatedPlaylist, updatedSongs] = await Promise.all([
      // add all songs ID from delete playlist to target playlist
      PlaylistModel.findByIdAndUpdate(targetPlaylistId, {
        $addToSet: { songs: { $each: playlist.songs } },
      }),
      // add target playlist ID to songs's playlist_for property
      SongModel.updateMany(
        { _id: { $in: playlist.songs } },
        { $addToSet: { playlist_for: targetPlaylistId } }
      ),
    ]);
    appAssert(
      updatedPlaylist,
      INTERNAL_SERVER_ERROR,
      "Failed to add songs ID from delete playlist to target playlist"
    );
    appAssert(
      updatedSongs.modifiedCount > 0,
      INTERNAL_SERVER_ERROR,
      "Failed to add target playlist ID to songs's s playlist_for property "
    );
  }

  // delete target playlist
  await PlaylistModel.findOneAndDelete({
    _id: currentPlaylistId,
    user: userId,
  });

  return { playlist };
};
