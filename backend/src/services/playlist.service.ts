import { FilterQuery } from "mongoose";

import SongModel from "../models/song.model";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";
import { HttpCode } from "@joytify/shared-types/constants";
import {
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  PopulatedPlaylistResponse,
  RefactorPlaylistResponse,
  SongResponse,
  Musician,
  Label,
  Album,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import { joinLabels } from "../utils/join-labels.util";

interface CreatePlaylistServiceRequest extends CreatePlaylistRequest {
  userId: string;
}

interface UpdatePlaylistServiceRequest extends UpdatePlaylistRequest {
  userId: string;
}

type DeletePlaylistServiceRequest = {
  userId: string;
  currentPlaylistId: string;
  targetPlaylistId?: string;
};

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get user all playlist service
export const getUserPlaylists = async (userId: string, query: string) => {
  let defaultQueryParams: FilterQuery<PlaylistDocument> = {
    user: userId,
    default: true,
  };
  let userQueryParams: FilterQuery<PlaylistDocument> = {
    user: userId,
    default: false,
  };

  if (query && query.length > 0) {
    const titleRegex = new RegExp(query, "i");
    defaultQueryParams.title = titleRegex;
    userQueryParams.title = titleRegex;
  }

  const defaultPlaylist = await PlaylistModel.findOne(defaultQueryParams);

  const userPlaylists = await PlaylistModel.find(userQueryParams).sort({ createdAt: -1 });

  const playlists = [...(defaultPlaylist ? [defaultPlaylist] : []), ...userPlaylists].filter(
    Boolean
  );

  return { playlists };
};

// get playlist by id service
export const getUserPlaylistById = async (playlistId: string, userId: string) => {
  // get playlist info
  const playlist = await PlaylistModel.findOne({
    _id: playlistId,
    user: userId,
  })
    .populate({
      path: "songs",
      populate: [
        { path: "artist", select: "name", transform: (doc: Musician) => doc.name },
        { path: "composers", select: "name", transform: (doc: Musician) => doc.name },
        { path: "lyricists", select: "name", transform: (doc: Musician) => doc.name },
        { path: "languages", select: "label", transform: (doc: Label) => doc.label },
        { path: "album", select: "title", transform: (doc: Album) => doc.title },
      ],
    })
    .lean<PopulatedPlaylistResponse>();

  appAssert(playlist, NOT_FOUND, "Playlist not found");

  // refactor playlist songs's params from array to string
  const refactorPlaylist: RefactorPlaylistResponse = {
    ...playlist,
    songs: playlist.songs.map((song: SongResponse) => ({
      ...song,
      lyricists: joinLabels(song.lyricists),
      composers: joinLabels(song.composers),
      languages: joinLabels(song.languages),
      album: song.album || "",
    })),
  };

  return { playlist: refactorPlaylist };
};

// create new playlist service
export const createNewPlaylist = async (params: CreatePlaylistServiceRequest) => {
  const { userId, title } = params;

  const playlist = await PlaylistModel.create({ user: userId, title });

  appAssert(playlist, INTERNAL_SERVER_ERROR, "Failed to create playlist");

  return { playlist };
};

// update playlist cover image service
export const updatePlaylistById = async (params: UpdatePlaylistServiceRequest) => {
  const { playlistId, userId, ...rest } = params;

  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    { _id: playlistId, user: userId },
    { ...rest },
    { new: true }
  );

  appAssert(updatedPlaylist, INTERNAL_SERVER_ERROR, "Failed to update playlist");

  return { playlist: updatedPlaylist };
};

// delete playlist service
export const deletePlaylistById = async (params: DeletePlaylistServiceRequest) => {
  const { userId, currentPlaylistId, targetPlaylistId } = params;

  // find the playlist to be deleted
  const playlist = await PlaylistModel.findById(currentPlaylistId);

  appAssert(playlist, NOT_FOUND, "The playlist is not found");

  // if have target playlist ID
  if (targetPlaylistId) {
    const [updatedPlaylist, updatedSongs] = await Promise.all([
      // add all songs ID from delete playlist to target playlist
      PlaylistModel.findByIdAndUpdate(
        targetPlaylistId,
        { $addToSet: { songs: { $each: playlist.songs } } },
        { new: true }
      ),
      // add target playlist ID to songs's playlistFor property
      SongModel.updateMany(
        { _id: { $in: playlist.songs } },
        { $addToSet: { playlistFor: targetPlaylistId } },
        { new: true }
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
      "Failed to add target playlist ID to songs's s playlistFor property "
    );
  }

  // delete target playlist
  const deletedPlaylist = await PlaylistModel.findOneAndDelete({
    _id: currentPlaylistId,
    user: userId,
  });

  appAssert(
    deletedPlaylist !== null,
    INTERNAL_SERVER_ERROR,
    `Failed to delete target playlist ${currentPlaylistId}`
  );

  return playlist;
};
