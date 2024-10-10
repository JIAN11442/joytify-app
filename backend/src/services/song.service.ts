import { FilterQuery } from "mongoose";

import SongModel from "../models/song.model";
import PlaylistModel from "../models/playlist.model";
import LabelModel, { LabelDocument } from "../models/label.model";
import { songSchemaType } from "../schemas/song.schema";
import LabelOptions from "../constants/label-type.constant";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";
import UserModel from "../models/user.model";

type composerParams = {
  userId: string;
  composer: string;
};

// create new song composer
export const createComposer = async ({ userId, composer }: composerParams) => {
  let composerId;

  const findQuery: FilterQuery<LabelDocument> = {
    label: composer,
    default: false,
    type: LabelOptions.COMPOSER,
  };

  const songComposer = await LabelModel.findOne(findQuery);

  // if not found, create label and return id
  if (!songComposer) {
    const createdComposer = await LabelModel.create({
      ...findQuery,
      author: userId,
    });
    composerId = createdComposer._id;
  }
  // if has found, return target label id
  else {
    composerId = songComposer._id;
  }

  appAssert(
    composerId,
    INTERNAL_SERVER_ERROR,
    "Failed to create or get composer"
  );

  return { composerId };
};

type createParams = {
  userId: string;
  songInfo: songSchemaType;
};

// create new song
export const createNewSong = async ({ userId, songInfo }: createParams) => {
  const { title, artist, composers, ...props } = songInfo;

  // check if song already exists
  const songIsExist = await SongModel.exists({
    userId,
    title,
    artist,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists");

  // get composers id
  const composerIds = await Promise.all(
    composers?.map(async (doc: string) => {
      const { composerId } = await createComposer({ userId, composer: doc });
      return composerId;
    }) || []
  );

  // // create new song
  const song = await SongModel.create({
    title,
    artist,
    userId,
    composers: composerIds,
    ...props,
  });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song");

  // update user total_songs
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $inc: { "account_info.total_songs": 1 },
  });

  appAssert(
    updatedUser,
    INTERNAL_SERVER_ERROR,
    "Failed to update user total songs"
  );

  // // update playlist songs list
  const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
    song.playlist_for,
    { $push: { songs: song._id } }
  );

  appAssert(
    updatedPlaylist,
    INTERNAL_SERVER_ERROR,
    "Failed to update playlist"
  );

  // update labels labelUsages
  const updatedLabels = await LabelModel.updateMany(
    { _id: { $in: song.composers } },
    { $push: { labelUsages: song._id } }
  );

  appAssert(
    updatedLabels,
    INTERNAL_SERVER_ERROR,
    "Failed to update composers labelUsages"
  );

  // update language labelUsages
  const updatedLanguages = await LabelModel.updateMany(
    { _id: { $in: song.languages } },
    { $push: { labelUsages: song._id } }
  );

  appAssert(
    updatedLanguages,
    INTERNAL_SERVER_ERROR,
    "Failed to update languages labelUsages"
  );

  return { song, updatedLabels };
};

// get song by id
export const getSongById = async (id: string) => {
  const song = await SongModel.findOne({ _id: id });

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // const paletee = await usePalette(song.imageUrl);

  // const generateSong = { ...song.toObject(), paletee };

  return { song };
};

type deleteParams = {
  userId: string;
  songId: string;
};

// delete song by id
export const deleteSongById = async ({ userId, songId }: deleteParams) => {
  // check if song exist
  const song = await SongModel.findOne({ _id: songId, userId });

  appAssert(song, NOT_FOUND, "Song not found");

  // update playlist
  const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
    { _id: song?.playlist_for },
    { $pull: { songs: song?._id } }
  );

  appAssert(
    updatedPlaylist,
    INTERNAL_SERVER_ERROR,
    "Failed to update playlist"
  );

  // update language labels
  const updatedLanguages = await LabelModel.updateMany(
    { _id: { $in: song.languages } },
    { $pull: { labelUsages: song._id } }
  );

  appAssert(
    updatedLanguages,
    INTERNAL_SERVER_ERROR,
    "Failed to update languages label"
  );

  // update composer labels
  const updatedComposers = await LabelModel.updateMany(
    { _id: { $in: song.composers } },
    { $pull: { labelUsages: song._id } }
  );

  appAssert(
    updatedComposers,
    INTERNAL_SERVER_ERROR,
    "Failed to update composers label"
  );

  // delete target song
  const deletedSong = await SongModel.findByIdAndDelete(song._id);

  appAssert(deletedSong, INTERNAL_SERVER_ERROR, "Failed to delete song");

  // update user total songs number
  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    $inc: { "account_info.total_songs": -1 },
  });

  appAssert(
    updatedUser,
    INTERNAL_SERVER_ERROR,
    "Failed to update user total songs"
  );

  return { deletedSong };
};
