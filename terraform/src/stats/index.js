import aws from "aws-sdk";
import { MongoClient } from "mongodb";
import {
  sendSnsNotification,
  moveCollectionPlaybacks,
  calculatePlaybackStatistics,
} from "./service.js";

export const handler = async (event) => {
  let client;

  const uri = process.env.MONGODB_CONNECTION_STRING;
  const snsTopicArn = process.env.SNS_TOPIC_ARN;

  const sns = new aws.SNS();
  const defaultMsg = { sns, snsTopicArn };

  try {
    client = new MongoClient(uri);

    await client.connect();

    const db = client.db("mern-joytify");
    const playbackCollection = db.collection("playbacks");
    const statsCollection = db.collection("stats");
    const historyCollection = db.collection("histories");

    const playbacks = await playbackCollection.find({}).toArray();

    if (playbacks.length) {
      for (const playback of playbacks) {
        const now = new Date();

        const userQuery = { user: playback.user };
        const userStats = await statsCollection.findOne(userQuery);

        const { songStats, artistStats, peakHourStats } =
          await calculatePlaybackStatistics({
            collection: playbackCollection,
            userId: playback.user,
          });

        const statsResult = {
          songs: songStats,
          artists: artistStats,
          peakHour: peakHourStats,
        };

        // stats user playbacks
        if (userStats) {
          await statsCollection.findOneAndUpdate(userQuery, {
            $push: { stats: { ...statsResult, createdAt: now } },
          });
        } else {
          await statsCollection.insertOne({
            user: playback.user,
            stats: [
              {
                songs: songStats,
                artists: artistStats,
                peakHour: peakHourStats,
                createdAt: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
            __v: 0,
          });
        }

        // backup user playbacks to history and clear playbacks
        await moveCollectionPlaybacks(
          playback,
          playbackCollection,
          historyCollection
        );

        console.log(`${playback.user} stats successfully`);
      }
    } else {
      console.log("Playbacks collection is empty");
      return;
    }

    await sendSnsNotification({
      ...defaultMsg,
      status: "success",
      detail: "Stats Lambda executed successfully",
    });
  } catch (error) {
    await sendSnsNotification({
      ...defaultMsg,
      status: "failure",
      detail: error.message,
    });

    console.log("error:", error);

    throw new Error(error);
  } finally {
    await client.close();
  }
};
