import { FilterQuery } from "mongoose";

import SongModel from "../models/song.model";
import LabelModel, { LabelDocument } from "../models/label.model";
import { songSchemaType } from "../schemas/song.schema";
import { LabelType } from "../constants/label-type.constant";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";
import ErrorCode from "../constants/error-code.constant";

type labelParams = {
  userId: string;
  doc: string;
  type: LabelType;
};

type createParams = {
  userId: string;
  songInfo: songSchemaType;
};

type deleteParams = {
  userId: string;
  songId: string;
};

type appAssertParams = [
  errorCode?: ErrorCode,
  firebaseUID?: string | null,
  awsUrl?: string[] | null
];

// create new label or get label id
export const getLabelIdFunc = async ({ userId, doc, type }: labelParams) => {
  let labelId;

  const findQuery: FilterQuery<LabelDocument> = {
    type,
    label: doc,
    default: false,
  };

  const label = await LabelModel.findOne(findQuery);

  // if not found, create label and return id
  if (!label) {
    const createdLabel = await LabelModel.create({
      ...findQuery,
      author: userId,
    });
    labelId = createdLabel._id;
  }
  // if has found, return target label id
  else {
    labelId = label._id;
  }

  appAssert(labelId, INTERNAL_SERVER_ERROR, "Failed to create or get label id");

  return { labelId };
};

// create new song
export const createNewSong = async ({ userId, songInfo }: createParams) => {
  const { title, artist, songUrl, imageUrl, ...props } = songInfo;

  const params: appAssertParams = [
    ErrorCode.CreateSongError,
    null,
    [songUrl, ...(imageUrl ? [imageUrl] : [])],
  ];

  // check if song already exists
  const songIsExist = await SongModel.exists({
    title,
    artist,
    userId,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists", ...params);

  // // create new song
  const song = await SongModel.create({
    title,
    artist,
    userId,
    songUrl,
    imageUrl,
    ...props,
  });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song", ...params);

  return { song };
};

// get song by id
export const getSongById = async (id: string) => {
  const song = await SongModel.findOne({ _id: id })
    .populate({ path: "artist", select: "label" })
    .populate({ path: "composers", select: "label" })
    .populate({ path: "languages", select: "label" });

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // const paletee = await usePalette(song.imageUrl);
  // const generateSong = { ...song.toObject(), paletee };

  return { song };
};

// delete song by id
export const deleteSongById = async ({ userId, songId }: deleteParams) => {
  // check if song exist
  const song = await SongModel.findOne({ _id: songId, userId });

  appAssert(song, NOT_FOUND, "Song not found");

  // delete target song
  const deletedSong = await SongModel.findByIdAndDelete(song._id);

  appAssert(deletedSong, INTERNAL_SERVER_ERROR, "Failed to delete song");

  return { deletedSong };
};
