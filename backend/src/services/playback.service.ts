import mongoose from "mongoose";
import SongModel from "../models/song.model";
import HistoryModel from "../models/history.model";
import PlaybackModel from "../models/playback.model";
import { trackPlaybackStats } from "./stats.service";
import { HttpCode } from "@joytify/shared-types/constants";
import { StorePlaybackLogRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

interface CreatePlaybackLogServiceRequest extends StorePlaybackLogRequest {
  userId: string;
}

const { INTERNAL_SERVER_ERROR } = HttpCode;

export const createPlaybackLog = async (data: CreatePlaybackLogServiceRequest) => {
  const { userId, songId, duration, state } = data;

  const song = await SongModel.findById(songId);

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  const artistId = song.artist;

  const playbackLog = await PlaybackModel.create({
    user: userId,
    artist: artistId,
    song: songId,
    state,
    duration,
  });

  appAssert(playbackLog, INTERNAL_SERVER_ERROR, "Failed to create playback log");

  await trackPlaybackStats({
    userId,
    songId,
    artistId,
    duration,
    timestamp: playbackLog.createdAt,
  });

  return { playbackLog };
};

export const getPlaybackStatisticsBySongId = async (songId: string) => {
  const songObjId = new mongoose.Types.ObjectId(songId);
  const initialResult = { count: 0, totalDuration: 0, durations: [] };

  const aggregateQuery = [
    { $match: { song: songObjId } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalDuration: { $sum: "$duration" },
        durations: { $push: "$duration" },
      },
    },
  ];

  const [playbackResults, historyResults] = await Promise.all([
    PlaybackModel.aggregate(aggregateQuery),
    HistoryModel.aggregate(aggregateQuery),
  ]);

  const playbackData = playbackResults[0] || initialResult;
  const historyData = historyResults[0] || initialResult;

  const totalCount = playbackData.count + historyData.count;
  const totalDuration = playbackData.totalDuration + historyData.totalDuration;

  if (totalCount === 0) {
    return { totalDuration: 0, totalCount: 0, weightedAvgDuration: 0 };
  }

  const allDurations = [...playbackData.durations, ...historyData.durations];

  const weightedAvgDuration =
    totalDuration > 0
      ? allDurations.reduce((acc, duration) => acc + duration * duration, 0) / totalDuration
      : 0;

  return { totalDuration, totalCount, weightedAvgDuration };
};
