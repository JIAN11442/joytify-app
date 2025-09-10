import mongoose, { FilterQuery } from "mongoose";
import SongModel, { SongDocument } from "../models/song.model";
import PlaylistModel, { PlaylistDocument } from "../models/playlist.model";

import { getPlaybackStatisticsBySongId } from "./playback.service";
import { HttpCode, ErrorCode } from "@joytify/types/constants";
import { PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";
import {
  CreateSongRequest,
  DeleteSongRequest,
  UpdateSongInfoRequest,
  UpdateSongPlaylistsRequest,
  RefactorSongResponse,
  PopulatedSongResponse,
} from "@joytify/types/types";
import appAssert from "../utils/app-assert.util";
import { parseToFloat } from "../utils/parse-float.util";
import { collectDocumentAttributes } from "./util.service";

type CreateSongServiceRequest = { userId: string; songInfo: CreateSongRequest };

interface DeleteSongServiceRequest extends DeleteSongRequest {
  userId: string;
}

interface UpdateSongInfoServiceRequest extends UpdateSongInfoRequest {
  userId: string;
}

interface UpdateSongPlaylistsServiceRequest extends UpdateSongPlaylistsRequest {
  userId: string;
}

type GetSongsByQueryServiceRequest = {
  query: string;
  playlistId?: string;
};

type AppAssert = [errorCode?: ErrorCode, firebaseUID?: string | null, awsUrl?: string[] | null];

const { INTERNAL_SERVER_ERROR, CONFLICT, NOT_FOUND } = HttpCode;
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
  const songs = await SongModel.find()
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse[]>();

  return { songs };
};

// get user's songs
export const getUserSongs = async (userId: string) => {
  const songs = await SongModel.find({ creator: userId, "ownership.isPlatformOwned": false })
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse[]>();

  return { songs };
};

// get song by id
export const getSongById = async (id: string) => {
  const song = await SongModel.findOne({ _id: id })
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse>();

  return { song };
};

// get songs by query
export const getSongsByQuery = async (params: GetSongsByQueryServiceRequest) => {
  const { query, playlistId } = params;

  const matchQuery: FilterQuery<SongDocument> = {
    $regex: query,
    $options: "i",
  };

  const filteredIds = await SongModel.aggregate([
    {
      $lookup: {
        from: "musicians",
        localField: "artist",
        foreignField: "_id",
        as: "artistDoc",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $lookup: {
        from: "albums",
        localField: "album",
        foreignField: "_id",
        as: "albumDoc",
        pipeline: [{ $project: { title: 1 } }],
      },
    },
    {
      $lookup: {
        from: "labels",
        let: { labelIds: { $setUnion: ["$genres", "$tags", "$languages"] } },
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$labelIds"] } } },
          { $project: { label: 1 } },
        ],
        as: "labelDocs",
      },
    },
    {
      $match: {
        ...(playlistId ? { playlistFor: { $nin: [new mongoose.Types.ObjectId(playlistId)] } } : {}),
        $or: [
          { title: matchQuery },
          { "artistDoc.name": matchQuery },
          { "albumDoc.title": matchQuery },
          { "labelDocs.label": matchQuery },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);

  const songs = await SongModel.find({ _id: { $in: filteredIds } })
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse[]>();

  return songs;
};

// get recommended songs
export const getRecommendedSongs = async (playlistId: string) => {
  const playlist = await PlaylistModel.findById(playlistId);

  appAssert(playlist, NOT_FOUND, "playlist not found");

  const features = await collectDocumentAttributes({
    model: SongModel,
    ids: playlist.songs,
    fields: ["genres", "tags", "languages", "artists", "albums"],
  });

  const recommendedSongs = await SongModel.find({
    _id: { $nin: playlist.songs },
    $or: [
      { genres: { $in: features.genres } },
      { tags: { $in: features.tags } },
      { languages: { $in: features.languages } },
      { artists: { $in: features.artists } },
      { albums: { $in: features.albums } },
    ],
  })
    .limit(PROFILE_FETCH_LIMIT)
    .populateSongDetails()
    .refactorSongFields<PopulatedSongResponse>()
    .lean<RefactorSongResponse[]>();

  return recommendedSongs;
};

// re-calculate target song's total duration, total count and average duration
export const refreshSongPlaybackStats = async (songId: string) => {
  const { totalDuration, totalCount, weightedAvgDuration } =
    await getPlaybackStatisticsBySongId(songId);

  const updatedSong = await SongModel.findByIdAndUpdate(
    songId,
    {
      "activities.totalPlaybackCount": totalCount,
      "activities.totalPlaybackDuration": parseToFloat(totalDuration),
      "activities.weightedAveragePlaybackDuration": parseToFloat(weightedAvgDuration),
    },
    { new: true }
  );

  appAssert(updatedSong, NOT_FOUND, "Song not found");

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

  appAssert(updatedSong, NOT_FOUND, "Song not found or access denied");

  return { updatedSong };
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

    appAssert(updatedSong, NOT_FOUND, "Song not found");

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

    appAssert(deletedSong !== null, NOT_FOUND, "Song not found or access denied");

    return { deletedSong };
  } else {
    const updatedSong = await SongModel.findOneAndUpdate(
      queryParams,
      { $set: { "ownership.isPlatformOwned": true } },
      { new: true }
    );

    appAssert(updatedSong, NOT_FOUND, "Song not found or access denied");

    return { updatedSong };
  }
};
