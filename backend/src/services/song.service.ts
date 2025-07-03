import mongoose, { FilterQuery } from "mongoose";
import SongModel, { SongDocument } from "../models/song.model";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";

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
  UpdateSongRateStateRequest,
  PopulatedSongRate,
  UpdateSongPlaylistsRequest,
  UpdateSongInfoRequest,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";
import { joinLabels } from "../utils/join-labels.util";
import { parseToFloat } from "../utils/parse-float.util";

type CreateSongServiceRequest = { userId: string; songInfo: CreateSongRequest };

interface DeleteSongServiceRequest extends DeleteSongRequest {
  userId: string;
}

interface UpdateSongInfoServiceRequest extends UpdateSongInfoRequest {
  userId: string;
}

interface UpdateSongRateServiceRequest extends UpdateSongRateStateRequest {
  userId: string;
}

interface UpdateSongPlaylistsServiceRequest extends UpdateSongPlaylistsRequest {
  userId: string;
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
  const songIsExist = await SongModel.exists({ title, artist });

  appAssert(!songIsExist, CONFLICT, "Song already exists", ...appAssertParams);

  // create new song
  const song = await SongModel.create({
    title,
    artist,
    creator: userId,
    songUrl,
    imageUrl,
    ...props,
  });

  appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song", ...appAssertParams);

  return { song };
};

// get all songs
export const getAllSongs = async () => {
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
    .populate({ path: "ratings.id", select: "username profileImage" })
    .lean<SongResponse>();

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // refactor song's params from array to string
  const refactorSong: RefactorSongResponse = {
    ...song,
    lyricists: joinLabels(song.lyricists),
    composers: joinLabels(song.composers),
    languages: joinLabels(song.languages),
    album: song.album || "",
    ratings: song.ratings.map((rating: PopulatedSongRate) => ({
      id: rating.id._id,
      username: rating.id.username,
      profileImage: rating.id.profileImage,
      rating: rating.rating,
      comment: rating.comment,
    })),
  };

  return { song: refactorSong };
};

// get user's songs
export const getUserSongs = async (userId: string) => {
  const songs = await SongModel.find({ creator: userId, "ownership.isPlatformOwned": false })
    .populate({ path: "artist", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "lyricists", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "composers", select: "name", transform: (doc: Musician) => doc.name })
    .populate({ path: "languages", select: "label", transform: (doc: Label) => doc.label })
    .populate({ path: "album", select: "title", transform: (doc: Album) => doc.title })
    .populate({ path: "genres", select: "label", transform: (doc: Label) => doc.label })
    .populate({ path: "tags", select: "label", transform: (doc: Label) => doc.label })
    .populate({ path: "ratings.id", select: "username profileImage" })
    .lean<PopulatedSongRate[]>();

  const refactorSongs: RefactorSongResponse[] = songs.map((song: SongResponse) => ({
    ...song,
    lyricists: joinLabels(song.lyricists),
    composers: joinLabels(song.composers),
    languages: joinLabels(song.languages),
    album: song.album || "",
    ratings: song.ratings.map((rating) => ({
      id: rating.id._id,
      username: rating.id.username,
      profileImage: rating.id.profileImage,
      rating: rating.rating,
      comment: rating.comment,
    })),
  }));

  return { songs: refactorSongs };
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

// stats user's songs
export const statsUserSongs = async (userId: string) => {
  const objUserId = new mongoose.Types.ObjectId(userId);

  const stats = await SongModel.aggregate([
    { $match: { creator: objUserId, "ownership.isPlatformOwned": false } },
    {
      $project: {
        totalRating: { $sum: "$ratings.rating" },
        totalRatingCount: { $size: "$ratings" },
        activities: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalSongs: { $sum: 1 },
        totalPlaybackCount: { $sum: "$activities.totalPlaybackCount" },
        totalWeightedPlaybackDuration: { $sum: "$activities.weightedAveragePlaybackDuration" },
        totalRating: { $sum: "$totalRating" },
        totalRatingCount: { $sum: "$totalRatingCount" },
      },
    },
    {
      $project: {
        totalSongs: 1,
        totalPlaybackCount: 1,
        totalWeightedPlaybackDuration: 1,
        averageRating: {
          // if totalRatingCount is 0, return 0,
          // otherwise return totalRating / totalRatingCount
          $cond: [
            { $eq: ["$totalRatingCount", 0] },
            0,
            { $divide: ["$totalRating", "$totalRatingCount"] },
          ],
        },
      },
    },
  ]);

  return stats[0];
};

// update target song info
export const updateSongInfoById = async (params: UpdateSongInfoServiceRequest) => {
  const { userId, songId, ...rest } = params;

  const updatedSong = await SongModel.findOneAndUpdate(
    { _id: songId, creator: userId },
    { $set: rest },
    { new: true }
  );

  appAssert(updatedSong, INTERNAL_SERVER_ERROR, "Failed to update song's info");

  return { updatedSong };
};

// update target song's rating
export const rateTargetSong = async (params: UpdateSongRateServiceRequest) => {
  const { userId, songId, rating, isLiked, comment } = params;

  // update default playlist if liked and get playlist ID for song's playlistFor
  const playlistId = isLiked
    ? (
        await PlaylistModel.findOneAndUpdate(
          { user: userId, default: true },
          { $addToSet: { songs: songId } },
          { new: true }
        )
      )?._id.toString()
    : undefined;

  // update rating if exists
  let updatedSongRating = await SongModel.findOneAndUpdate(
    { _id: songId, "ratings.id": userId },
    {
      $set: { "ratings.$.rating": rating, "ratings.$.comment": comment },
      ...(isLiked && { $addToSet: { favorites: userId, playlistFor: playlistId } }),
    },
    { new: true }
  );

  // create new rating if doesn't exist
  if (!updatedSongRating) {
    updatedSongRating = await SongModel.findByIdAndUpdate(songId, {
      $push: { ratings: { id: userId, rating, comment } },
      ...(isLiked && { $addToSet: { favorites: userId, playlistFor: playlistId } }),
    });
  }

  appAssert(updatedSongRating, INTERNAL_SERVER_ERROR, "Failed to update song's rating");
  return { updatedSong: updatedSongRating };
};

// update target song's playlists
export const assignSongToPlaylists = async (params: UpdateSongPlaylistsServiceRequest) => {
  const { userId, songId, playlistsToAdd, playlistsToRemove } = params;
  const session = await mongoose.startSession();

  // start a session for transaction
  session.startTransaction();

  try {
    let updatedSong;

    // get full playlists data
    const addedPlaylists = await PlaylistModel.find({ _id: { $in: playlistsToAdd } }).lean();
    const removedPlaylists = await PlaylistModel.find({ _id: { $in: playlistsToRemove } }).lean();

    // update song's playlistFor - separate add and remove operations
    if (playlistsToAdd.length > 0) {
      updatedSong = await SongModel.findByIdAndUpdate(
        songId,
        {
          $addToSet: {
            playlistFor: { $each: playlistsToAdd },
            ...(addedPlaylists.some((p: PlaylistDocument) => p.default) && { favorites: userId }),
          },
        },
        { session }
      );
    }

    if (playlistsToRemove.length > 0) {
      updatedSong = await SongModel.findByIdAndUpdate(
        songId,
        {
          $pull: {
            playlistFor: { $in: playlistsToRemove },
            ...(removedPlaylists.some((p: PlaylistDocument) => p.default) && { favorites: userId }),
          },
        },
        { session }
      );
    }

    appAssert(updatedSong, INTERNAL_SERVER_ERROR, "Failed to update song's playlists");

    // update playlists' songs
    await Promise.all([
      // add song to playlists
      ...(playlistsToAdd.length > 0
        ? [
            PlaylistModel.updateMany(
              { _id: { $in: playlistsToAdd }, user: userId },
              {
                $addToSet: { songs: songId },
                $inc: {
                  "stats.totalSongCount": 1,
                  "stats.totalSongDuration": updatedSong.duration,
                },
              },
              { session }
            ),
          ]
        : []),

      // remove song from playlists
      ...(playlistsToRemove.length > 0
        ? [
            PlaylistModel.updateMany(
              { _id: { $in: playlistsToRemove }, user: userId },
              {
                $pull: { songs: songId },
                $inc: {
                  "stats.totalSongCount": -1,
                  "stats.totalSongDuration": updatedSong.duration * -1,
                },
              },
              { session }
            ),
          ]
        : []),
    ]);

    // commit the transaction
    await session.commitTransaction();
    return { updatedSong };
  } catch (error) {
    // if an error occurred, abort the transaction
    await session.abortTransaction();
    throw error;
  } finally {
    // end the session
    session.endSession();
  }
};

// delete song by id
export const deleteSongById = async (params: DeleteSongServiceRequest) => {
  const { songId, userId, shouldDeleteSongs } = params;

  const queryParams: FilterQuery<SongDocument> = {
    _id: songId,
    creator: userId,
  };

  if (shouldDeleteSongs) {
    const deletedSong = await SongModel.findOneAndDelete(queryParams);

    appAssert(
      deletedSong !== null,
      INTERNAL_SERVER_ERROR,
      `Failed to delete target song ${songId}`
    );

    return { deletedSong };
  } else {
    const updatedSong = await SongModel.findOneAndUpdate(
      queryParams,
      { $set: { "ownership.isPlatformOwned": true } },
      { new: true }
    );

    appAssert(updatedSong, INTERNAL_SERVER_ERROR, "Failed to update target song's ownership");

    return { updatedSong };
  }
};
