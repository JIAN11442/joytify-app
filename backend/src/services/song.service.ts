import { FilterQuery } from "mongoose";

import SongModel from "../models/song.model";
import PlaylistModel from "../models/playlist.model";
import LabelModel, { LabelDocument } from "../models/label.model";
import { songSchemaType } from "../schemas/song.schema";
import LabelOptions from "../constants/label-type.constant";
import appAssert from "../utils/app-assert.util";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
} from "../constants/http-code.constant";

type composerParams = {
  userId: string;
  composer: string;
};

// create new song composer
export const createComposer = async ({ userId, composer }: composerParams) => {
  let composerId;

  const findQuery: FilterQuery<LabelDocument> = {
    userId,
    label: composer,
    default: false,
    type: LabelOptions.COMPOSER,
  };

  const songComposer = await LabelModel.findOne(findQuery);

  // if not found, create label and return id
  if (!songComposer) {
    const createdComposer = await LabelModel.create(findQuery);
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
  const { title, artist, composer, ...props } = songInfo;

  // check if song already exists
  const songIsExist = await SongModel.exists({
    userId,
    title,
    artist,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists");

  // get composers id
  const composerIds = await Promise.all(
    composer?.map(async (doc: string) => {
      const { composerId } = await createComposer({ userId, composer: doc });
      return composerId;
    }) || []
  );

  // // create new song
  const song = await SongModel.create({
    title,
    artist,
    userId,
    composer: composerIds,
    ...props,
  });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song");

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
    { _id: { $in: song.composer } },
    { $push: { labelUsages: song._id } }
  );

  appAssert(
    updatedLabels,
    INTERNAL_SERVER_ERROR,
    "Failed to update composers labelUsages"
  );

  // update language labelUsages
  const updatedLanguages = await LabelModel.updateMany(
    { _id: { $in: song.language } },
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
