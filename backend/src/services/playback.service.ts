import mongoose from "mongoose";

import SongModel from "../models/song.model";
import PlaybackModel from "../models/playback.model";
import HistoryModel from "../models/history.model";

import { PlaybackStateType } from "../constants/playback.constant";
import { INTERNAL_SERVER_ERROR } from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";

type CreateParams = {
  userId: string;
  songId: string;
  duration: number;
  timestamp: Date;
  state: PlaybackStateType;
};

// create or update playback logs service
export const createOrUpdatePlaybackLog = async (data: CreateParams) => {
  const { userId, songId, ...rest } = data;

  let playbackLog;

  // make sure song exists
  const song = await SongModel.findById(songId);
  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  // check if user has playback log
  const userPlaybackLog = await PlaybackModel.findOne({ user: userId });

  if (userPlaybackLog) {
    // Check if the song already exists in the user's playback log
    const songExists = userPlaybackLog.songs.some(
      (song) => song.id.toString() === songId.toString()
    );

    if (songExists) {
      // If song exists, push new stats to the existing song
      // "$elemMatch" -> find the first song that matches the condition
      // "$" -> refers to the first song that matches the condition
      playbackLog = await PlaybackModel.findOneAndUpdate(
        { user: userId, songs: { $elemMatch: { id: songId } } },
        { $push: { "songs.$.playbacks": rest } },
        { new: true }
      );

      appAssert(
        playbackLog,
        INTERNAL_SERVER_ERROR,
        "Failed to record new playback log"
      );
    } else {
      // If song does not exist, add new song with stats
      playbackLog = await PlaybackModel.findOneAndUpdate(
        { user: userId },
        {
          $push: {
            songs: { id: song.id, artist: song.artist, playbacks: [rest] },
          },
        },
        { new: true }
      );

      appAssert(
        playbackLog,
        INTERNAL_SERVER_ERROR,
        "Failed to create new song playback log"
      );
    }
  } else {
    // If user does not have a playback log, create a new one
    playbackLog = await PlaybackModel.create({
      user: userId,
      songs: [{ id: song.id, artist: song.artist, playbacks: [rest] }],
    });

    appAssert(
      playbackLog,
      INTERNAL_SERVER_ERROR,
      "Failed to create a new user playback log"
    );
  }

  return { playbackLog };
};

// get all playback logs service
export const getAllPlaybackLogs = async () => {
  const playbackLogs = await PlaybackModel.find({});

  return { playbackLogs };
};

// get total playback duration and count by song id
export const getTotalPlaybackDurationAndCount = async (songId: string) => {
  const songObjId = new mongoose.Types.ObjectId(songId);

  // stats total playback duration and count by song id
  const executeAggregateQuery = async (
    model: mongoose.Model<any>,
    songId: mongoose.Types.ObjectId
  ) => {
    const aggregateQuery = [
      { $unwind: "$songs" },
      { $match: { "songs.id": songId } },
      { $unwind: "$songs.playbacks" },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$songs.playbacks.duration" },
          count: { $sum: 1 },
          durations: { $push: "$songs.playbacks.duration" },
        },
      },
      { $project: { _id: 0, totalDuration: 1, count: 1, durations: 1 } },
    ];

    const result = await model.aggregate(aggregateQuery);

    return result.length > 0
      ? result[0]
      : { totalDuration: 0, count: 0, durations: [] };
  };

  const playbackResult = await executeAggregateQuery(PlaybackModel, songObjId);
  const historyResult = await executeAggregateQuery(HistoryModel, songObjId);

  const totalCount = playbackResult.count + historyResult.count;
  const totalDuration =
    playbackResult.totalDuration + historyResult.totalDuration;
  const durations = [...playbackResult.durations, ...historyResult.durations];

  const weightedAvgDuration = durations.reduce((acc, duration) => {
    const weight = duration / totalDuration;
    return acc + duration * weight;
  }, 0);

  return { totalDuration, totalCount, weightedAvgDuration };
};
