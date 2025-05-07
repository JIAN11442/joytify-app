import { FilterQuery } from "mongoose";
import SongModel, { SongDocument } from "../models/song.model";

import { getTotalPlaybackDurationAndCount } from "./playback.service";
import { HttpCode, ErrorCode } from "@joytify/shared-types/constants";
import {
  CreateSongRequest,
  DeleteSongRequest,
  SongResponse,
  RefactorSongResponse,
  Musician,
  Label,
  Album,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import { joinLabels } from "../utils/join-labels.util";
import { parseToFloat } from "../utils/parse-float.util";

type CreateSongServiceRequest = { userId: string; songInfo: CreateSongRequest };

interface DeleteSongServiceRequest extends DeleteSongRequest {
  userId?: string;
}

type AppAssert = [errorCode?: ErrorCode, firebaseUID?: string | null, awsUrl?: string[] | null];

const { INTERNAL_SERVER_ERROR, CONFLICT } = HttpCode;
const { CREATE_SONG_ERROR } = ErrorCode;

// create new song
export const createNewSong = async (params: CreateSongServiceRequest) => {
  const { userId, songInfo } = params;
  const { title, artist, songUrl, imageUrl, ...props } = songInfo;

  // app assert params
  const appAssertParams: AppAssert = [
    CREATE_SONG_ERROR,
    null,
    [songUrl, ...(imageUrl ? [imageUrl] : [])],
  ];

  // check if song already exists
  const songIsExist = await SongModel.exists({
    title,
    artist,
    followers: userId,
  });

  appAssert(!songIsExist, CONFLICT, "Song already exists", ...appAssertParams);

  // create new song
  const song = await SongModel.create({
    title,
    artist,
    creator: userId,
    followers: [userId],
    songUrl,
    imageUrl,
    ...props,
  });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song", ...appAssertParams);

  return { song };
};

// get all songs
export const getSongs = async () => {
  // get songs
  const songs = await SongModel.find()
    .populate({ path: "artist", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "lyricists", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "composers", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "languages", select: "label", transform: (doc: Label) => doc.label })
    .populate({ path: "album", select: "title", transform: (doc: Album) => doc.title })
    .lean<SongResponse[]>();

  // refactor songs's params from array to string
  const refactorSongs: RefactorSongResponse[] = songs.map((song: SongResponse) => ({
    ...song,
    lyricists: joinLabels(song.lyricists),
    composers: joinLabels(song.composers),
    languages: joinLabels(song.languages),
    album: song.album || "",
  }));

  return { songs: refactorSongs };
};

// get song by id
export const getSongById = async (id: string) => {
  // get target id song
  const song = await SongModel.findOne({ _id: id })
    .populate({ path: "artist", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "lyricists", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "composers", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "languages", select: "label", transform: (doc: Label) => doc.label })
    .populate({ path: "album", select: "title", transform: (doc: Album) => doc.title })
    .lean<SongResponse>();

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // refactor song's params from array to string
  const refactorSong: RefactorSongResponse = {
    ...song,
    lyricists: joinLabels(song.lyricists),
    composers: joinLabels(song.composers),
    languages: joinLabels(song.languages),
    album: song.album || "",
  };

  return { song: refactorSong };
};

// delete song by id(*)
export const deleteSongById = async (params: DeleteSongServiceRequest) => {
  const { songId, userId } = params;

  const queryParams: FilterQuery<SongDocument> = {
    _id: songId,
    ...(userId ? { creator: userId } : {}),
  };

  const deletedSong = await SongModel.findOneAndDelete(queryParams);

  appAssert(deletedSong !== null, INTERNAL_SERVER_ERROR, `Failed to delete target song ${songId}`);

  return { deletedSong };
};

// re-calculate target song's total duration, total count and average duration
export const refreshSongPlaybackStats = async (songId: string) => {
  const { totalDuration, totalCount, weightedAvgDuration } =
    await getTotalPlaybackDurationAndCount(songId);

  const updatedSong = await SongModel.findByIdAndUpdate(
    songId,
    {
      "activities.totalPlaybackCount": totalCount,
      "activities.totalPlaybackDuration": parseToFloat(totalDuration),
      "activities.weightedAveragePlaybackDuration": parseToFloat(weightedAvgDuration),
    },
    { new: true }
  );

  appAssert(updatedSong, INTERNAL_SERVER_ERROR, "Failed to update song's activities");

  return { updatedSong };
};
