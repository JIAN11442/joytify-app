import SongModel from "../models/song.model";
import { songSchemaType } from "../schemas/song.schema";
import { LabelType } from "../constants/label-type.constant";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import ErrorCode from "../constants/error-code.constant";
import appAssert from "../utils/app-assert.util";

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
    followers: userId,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists", ...params);

  // // create new song
  const song = await SongModel.create({
    title,
    artist,
    creator: userId,
    followers: [userId],
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
    .populate({ path: "languages", select: "label" })
    .populate({ path: "album", select: "title" });

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // const paletee = await usePalette(song.imageUrl);
  // const generateSong = { ...song.toObject(), paletee };

  return { song };
};

// delete song by id
export const deleteSongById = async ({ userId, songId }: deleteParams) => {
  // check if song exist
  const song = await SongModel.findOne({ _id: songId, creator: userId });

  appAssert(song, NOT_FOUND, "Song not found");

  // delete target song
  const deletedSong = await SongModel.findByIdAndDelete(song._id);

  appAssert(deletedSong, INTERNAL_SERVER_ERROR, "Failed to delete song");

  return { deletedSong };
};
