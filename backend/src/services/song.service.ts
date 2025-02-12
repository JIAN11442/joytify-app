import SongModel from "../models/song.model";
import { getTotalPlaybackDurationAndCount } from "./playback.service";

import { SongZodSchemaType } from "../schemas/song.zod";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import ErrorCode from "../constants/error-code.constant";
import appAssert from "../utils/app-assert.util";
import { parseToFloat } from "../utils/parse-float.util";

type CreateParams = {
  userId: string;
  songInfo: SongZodSchemaType;
};

type DeleteParams = {
  userId: string;
  songId: string;
};

type AppAssertParams = [
  errorCode?: ErrorCode,
  firebaseUID?: string | null,
  awsUrl?: string[] | null,
];

// create new song
export const createNewSong = async ({ userId, songInfo }: CreateParams) => {
  const { title, artist, songUrl, imageUrl, ...props } = songInfo;

  const params: AppAssertParams = [
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
    .populate({ path: "artist", select: "name" })
    .populate({ path: "lyricists", select: "name" })
    .populate({ path: "composers", select: "name" })
    .populate({ path: "languages", select: "label" })
    .populate({ path: "album", select: "title" });

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // const paletee = await usePalette(song.imageUrl);
  // const generateSong = { ...song.toObject(), paletee };

  return { song };
};

// re-calculate target song's total duration, total count and average duration
export const refreshSongPlaybackStats = async (songId: string) => {
  const { totalDuration, totalCount, weightedAvgDuration } =
    await getTotalPlaybackDurationAndCount(songId);

  const updatedSong = await SongModel.findByIdAndUpdate(
    songId,
    {
      "activity.total_playback_count": totalCount,
      "activity.total_playback_duration": parseToFloat(totalDuration),
      "activity.weighted_average_playback_duration":
        parseToFloat(weightedAvgDuration),
    },
    { new: true }
  );

  appAssert(
    updatedSong,
    INTERNAL_SERVER_ERROR,
    "Failed to update song's activity"
  );

  return { updatedSong };
};

// delete song by id
export const deleteSongById = async ({ userId, songId }: DeleteParams) => {
  // check if song exist
  const song = await SongModel.findOne({ _id: songId, creator: userId });

  appAssert(song, NOT_FOUND, "Song not found");

  // delete target song
  const deletedSong = await SongModel.findByIdAndDelete(song._id);

  appAssert(deletedSong, INTERNAL_SERVER_ERROR, "Failed to delete song");

  return { deletedSong };
};
