import SongModel from "../models/song.model";
import RatingModel from "../models/rating.model";
import PlaylistModel from "../models/playlist.model";
import PlaybackModel from "../models/playback.model";
import { getSongById } from "./song.service";
import { HttpCode, RatingTypeOptions } from "@joytify/shared-types/constants";
import {
  MIN_RATING_PROMPT_THRESHOLD,
  MAX_RATING_PROMPT_THRESHOLD,
} from "../constants/env-validate.constant";
import {
  RatingType,
  UpsertRatingRequest,
  UpsertSongRatingRequet,
} from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

interface UpsertRatingServiceRequest extends UpsertRatingRequest {
  type: RatingType;
  userId: string;
}

interface UpsertSongRatingServiceRequest extends UpsertSongRatingRequet {
  type: RatingType;
  userId: string;
}

type GetRatingBySongIdServiceRequest = {
  userId: string;
  songId: string;
};

type ShouldPromptForRatingServiceRequest = {
  userId: string;
  songId: string;
};

const { SONG } = RatingTypeOptions;
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

const upsertRating = async (params: UpsertRatingServiceRequest) => {
  const { type, userId, songId, ...rest } = params;

  // 1. check if rating exists
  const existingRating = await RatingModel.findOne({
    type,
    user: userId,
    song: songId,
  });

  let result;
  let isNew = false;

  // 2. if rating exists, update it
  if (existingRating) {
    result = await RatingModel.findByIdAndUpdate(
      existingRating._id,
      { ...rest },
      { new: true, runValidators: true }
    );
  }
  // 3. if rating doesn't exist, create it
  else {
    result = await RatingModel.create({
      type,
      user: userId,
      song: songId,
      ...rest,
    });

    isNew = true;
  }

  // 確保 result 不為 undefined
  appAssert(result, INTERNAL_SERVER_ERROR, "Failed to upsert rating");

  return { rating: result, isNew };
};

const shouldPromptAtPlayCount = (count: number): boolean => {
  const minThreshold = MIN_RATING_PROMPT_THRESHOLD;
  const midThreshold = MIN_RATING_PROMPT_THRESHOLD * 2;
  const maxThreshold = MAX_RATING_PROMPT_THRESHOLD;

  // first prompt at min threshold
  // second prompt at mid threshold
  // then prompt every max threshold after that
  return (
    count === minThreshold ||
    count === midThreshold ||
    (count > midThreshold && (count - midThreshold) % maxThreshold === 0)
  );
};

export const getRatingBySongId = async (params: GetRatingBySongIdServiceRequest) => {
  const { userId, songId } = params;
  const rating = await RatingModel.findOne({ type: SONG, user: userId, song: songId });

  return rating ?? null;
};

export const upsertSongRating = async (params: UpsertSongRatingServiceRequest) => {
  const { userId, songId, songDuration, rating, comment, liked } = params;

  // 1. upsert song rating
  const ratingResult = await upsertRating({
    type: SONG,
    userId,
    songId,
    rating,
    comment,
  });

  // 2. extract rating ID for song update
  const songRatingId = ratingResult.rating._id.toString();

  // 3. initialize song update query (always update ratings)
  let updateQuery: any = {
    $addToSet: { ratings: songRatingId },
  };

  // 4. handle like functionality if user liked the song
  if (liked) {
    // add song to user's default playlist
    const defaultPlaylist = await PlaylistModel.findOneAndUpdate(
      { user: userId, default: true },
      {
        $addToSet: { songs: songId },
        $inc: {
          "stats.totalSongCount": 1,
          "stats.totalSongDuration": songDuration,
        },
      },
      { new: true }
    );

    // add user to song's favorites and playlistFor
    updateQuery.$addToSet.favorites = userId;
    updateQuery.$addToSet.playlistFor = defaultPlaylist?._id.toString();
  }

  // 5. update song with new rating and like data
  const updatedSong = await SongModel.findByIdAndUpdate(songId, updateQuery, { new: true });

  appAssert(updatedSong, NOT_FOUND, "Song not found");

  return { updatedSong };
};

export const shouldPromptForRating = async (params: ShouldPromptForRatingServiceRequest) => {
  const { userId, songId } = params;

  // 1. get song
  const { song } = await getSongById(songId);

  appAssert(song, NOT_FOUND, "Song not found");

  // 2. initialize result
  let result = { shouldPrompt: false, song };

  // 3. check if user has already rated the song
  const rating = await getRatingBySongId({ userId, songId });

  if (rating) return result;

  // 4. if user haven't rated the song, check if need to prompt
  const playbackCount = await PlaybackModel.countDocuments({ user: userId, song: songId });
  const shouldPrompt = shouldPromptAtPlayCount(playbackCount);

  return { ...result, shouldPrompt };
};
