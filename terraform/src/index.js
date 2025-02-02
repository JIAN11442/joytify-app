const { MongoClient } = require("mongodb");
const {
  calculatePlaybackStatistics,
  moveCollectionPlaybacks,
} = require("./service");

exports.handler = async (event) => {
  const { MONGODB_CONNECTION_STRING } = process.env;

  const uri = MONGODB_CONNECTION_STRING;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("mern-joytify");
    const playbackCollection = db.collection("playbacks");
    const statsCollection = db.collection("stats");
    const historyCollection = db.collection("history");

    const playbacks = await playbackCollection.find({}).toArray();

    if (playbacks.length) {
      for (const playback of playbacks) {
        const now = new Date();

        const userQuery = { user: playback.user };
        const userStats = await statsCollection.findOne(userQuery);
        const { songStats, artistStats, peakHourStats } =
          calculatePlaybackStatistics(playback);

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
  } catch (error) {
    console.log(error);
    throw new Error(error);
  } finally {
    await client.close();
  }
};
