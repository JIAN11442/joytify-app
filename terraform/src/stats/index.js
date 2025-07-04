import pLimit from "p-limit";
import { MongoClient } from "mongodb";

import { moveCollectionPlaybacks, calculatePlaybackStatistics } from "./service.js";

const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
const BATCH_SIZE = Number(process.env.BATCH_SIZE);
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT);

const processBatch = async (
  playbackBatch,
  playbackCollection,
  statsCollection,
  historyCollection
) => {
  const limit = pLimit(MAX_CONCURRENT);
  let batchDurationMs = 0;
  let batchSuccessProcessedCount = 0;
  let batchFailedProcessCount = 0;
  let batchFailedProcessUsers = [];

  await Promise.all(
    playbackBatch.map((playback) =>
      limit(async () => {
        const startTime = Date.now();

        try {
          const now = new Date();
          const userQuery = { user: playback.user };

          const { songStats, artistStats, peakHourStats } = await calculatePlaybackStatistics({
            collection: playbackCollection,
            userId: playback.user,
          });

          const statsResult = { songs: songStats, artists: artistStats, peakHour: peakHourStats };

          // stats user playbacks
          await statsCollection.updateOne(
            userQuery,
            {
              $push: { stats: statsResult },
              $setOnInsert: { createdAt: now },
              $set: { updatedAt: now },
            },
            { upsert: true }
          );

          // backup user playbacks to history and clear playbacks
          await moveCollectionPlaybacks(playback, playbackCollection, historyCollection);

          // accumulate batch execution duration
          const duration = Date.now() - startTime;
          batchDurationMs += duration;

          // accumulate success process count
          batchSuccessProcessedCount++;
        } catch (error) {
          // accumulate batch execution duration
          const duration = Date.now() - startTime;
          batchDurationMs += duration;

          // accumulate failed process users
          batchFailedProcessCount++;
          batchFailedProcessUsers.push(playback.user);
        }
      })
    )
  );

  return {
    batchDurationMs,
    batchSuccessProcessedCount,
    batchFailedProcessCount,
    batchFailedProcessUsers,
  };
};

export const handler = async (event) => {
  const { skip, limit } = event;
  const client = new MongoClient(MONGODB_CONNECTION_STRING);

  let durationMs = 0;
  let successProcessedCount = 0;
  let failedProcessCount = 0;

  let batchPlaybacks = [];
  let failedProcessUsers = [];

  try {
    await client.connect();
    const db = client.db("mern-joytify");

    const playbackCollection = db.collection("playbacks");
    const statsCollection = db.collection("stats");
    const historyCollection = db.collection("histories");

    const playbacks = playbackCollection.find().skip(skip).limit(limit);

    // process playbacks in batches to avoid memory overflow
    for await (const playback of playbacks) {
      // add playback to batch
      batchPlaybacks.push(playback);

      // process batch if it reaches the specified size
      if (batchPlaybacks.length >= BATCH_SIZE) {
        const results = await processBatch(
          batchPlaybacks,
          playbackCollection,
          statsCollection,
          historyCollection
        );

        // accumulate results
        durationMs += results.batchDurationMs;
        successProcessedCount += results.batchSuccessProcessedCount;
        failedProcessCount += results.batchFailedProcessCount;
        failedProcessUsers.push(...results.batchFailedProcessUsers);

        // clear batch array for next batch
        batchPlaybacks = [];
      }
    }

    // process remaining playbacks in the final batch
    if (batchPlaybacks.length > 0) {
      const results = await processBatch(
        batchPlaybacks,
        playbackCollection,
        statsCollection,
        historyCollection
      );

      // accumulate results
      durationMs += results.batchDurationMs;
      successProcessedCount += results.batchSuccessProcessedCount;
      failedProcessCount += results.batchFailedProcessCount;
      failedProcessUsers.push(...results.batchFailedProcessUsers);
    }

    return {
      durationMs,
      successProcessedCount,
      failedProcessCount,
      failedProcessUsers,
    };
  } catch (error) {
    console.log("Stats Lambda Error:", error);

    throw new Error(error);
  } finally {
    await client?.close();
  }
};
