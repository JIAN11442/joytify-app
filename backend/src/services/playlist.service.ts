import { FilterQuery, UpdateQuery } from "mongoose";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";
import appAssert from "../utils/app-assert.util";
import {
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import usePalette from "../hooks/paletee.hook";
import SongModel, { SongDocument } from "../models/song.model";

type createPlaylistParams = {
  userId: string;
  title?: string;
};

interface updatePlaylistParams extends createPlaylistParams {
  playlistId: string;
  description?: string;
  imageUrl?: string;
}

type deletePlaylistParams = {
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
    userId,
    default: true,
  };
  let userQueryParams: FilterQuery<PlaylistDocument> = {
    userId,
    default: false,
    hidden: false,
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
  const playlist = await PlaylistModel.findOne({
    _id: playlistId,
    hidden: false,
    userId,
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

  // get paletee from cover image
  const paletee = await usePalette(playlist.cover_image);
  const newPlaylist = { ...playlist.toObject(), paletee };

  return { playlist: newPlaylist };
};

// create new playlist service
export const createNewPlaylist = async (data: createPlaylistParams) => {
  const playlist = await PlaylistModel.create({ ...data });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};

// update playlist cover image service
export const updatePlaylistById = async (data: updatePlaylistParams) => {
  const { playlistId, userId, title, description, imageUrl } = data;

  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    { _id: playlistId, userId },
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
export const deletePlaylistById = async (data: deletePlaylistParams) => {
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

  // update all songs from playlist to be delete
  if (playlist.songs.length) {
    const updatedSongs = await SongModel.updateMany(
      { _id: { $in: playlist.songs } },
      { $pull: { playlist_for: currentPlaylistId } }
    );

    appAssert(
      updatedSongs.modifiedCount > 0,
      INTERNAL_SERVER_ERROR,
      "Failed to remove deleted playlist ID from relate songs"
    );
  }

  // delete target playlist
  const deletedPlaylist = await PlaylistModel.findOneAndDelete({
    _id: currentPlaylistId,
    userId,
  });

  return { playlist };
};
