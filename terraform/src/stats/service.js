const getTimePeriod = ({
  now = new Date(),
  number,
  period,
  direction = "backward",
}) => {
  let startOfPeriod = new Date(now);
  let endOfPeriod = new Date(now);

  const adjustTime = (date, number, period) => {
    switch (period.toLowerCase()) {
      case "second":
      case "seconds":
        date.setSeconds(date.getSeconds() + number);
        break;
      case "minute":
      case "minutes":
        date.setMinutes(date.getMinutes() + number);
        break;
      case "hour":
      case "hours":
        date.setHours(date.getHours() + number);
        break;
      case "day":
      case "days":
        date.setDate(date.getDate() + number);
        break;
      case "month":
      case "months":
        date.setMonth(date.getMonth() + number);
        break;
      case "year":
      case "years":
        date.setFullYear(date.getFullYear() + number);
        break;
      default:
        throw new Error("Unsupported period unit");
    }
  };

  if (direction === "backward") {
    adjustTime(startOfPeriod, -number, period);
  } else if (direction === "forward") {
    adjustTime(endOfPeriod, number, period);
  } else {
    throw new Error("Unsupported direction");
  }

  return { startOfPeriod, endOfPeriod };
};

const calculatePlaybackStatistics = async ({
  collection,
  userId,
  sorting = "desc",
}) => {
  // sort order
  const sortOrder = sorting === "desc" ? -1 : 1;

  // get user song durations
  const getUserSongsDuration = async () => {
    const stats = await collection
      .aggregate([
        { $match: { user: userId } },
        { $unwind: "$songs" },
        { $unwind: "$songs.playbacks" },
        {
          $group: {
            _id: "$songs.id",
            totalDuration: { $sum: "$songs.playbacks.duration" },
          },
        },
        {
          $project: {
            _id: 0,
            song: "$_id",
            totalDuration: { $round: ["$totalDuration", 2] },
          },
        },
        { $sort: { totalDuration: sortOrder } },
      ])
      .toArray();

    return stats;
  };

  // get user artist durations
  const getUserArtistsDuration = async () => {
    const stats = await collection
      .aggregate([
        { $match: { user: userId } },
        { $unwind: "$songs" },
        { $unwind: "$songs.playbacks" },
        {
          $group: {
            _id: "$songs.artist",
            totalDuration: { $sum: "$songs.playbacks.duration" },
          },
        },
        {
          $project: {
            _id: 0,
            artist: "$_id",
            totalDuration: { $round: ["$totalDuration", 2] },
          },
        },
        { $sort: { totalDuration: sortOrder } },
      ])
      .toArray();

    return stats;
  };

  // get user playback peak hour
  const getUserPlaybacksPeahHour = async () => {
    const stats = await collection
      .aggregate([
        { $unwind: "$songs" },
        { $unwind: "$songs.playbacks" },
        {
          $addFields: {
            playbackHour: { $hour: "$songs.playbacks.timestamp" },
          },
        },
        {
          $group: {
            _id: "$playbackHour",
            totalDuration: { $sum: "$songs.playbacks.duration" },
          },
        },
        {
          $project: {
            _id: 0,
            hour: "$_id",
            totalDuration: { $round: ["$totalDuration", 2] },
            // utilization: {
            //   $round: [
            //     { $multiply: [{ $divide: ["$totalDuration", 3600] }, 100] },
            //     2,
            //   ],
            // },
          },
        },
        { $sort: { hour: 1 } },
      ])
      .toArray();

    // const fullDayStats = Array.from({ length: 24 }, (_, hour) => ({
    //   hour,
    //   totalDuration: 0,
    //   utilization: 0,
    // }));

    // stats.forEach((stat) => {
    //   fullDayStats[stat.hour] = stat;
    // });

    return stats;
  };

  return {
    songStats: await getUserSongsDuration(),
    artistStats: await getUserArtistsDuration(),
    peakHourStats: await getUserPlaybacksPeahHour(),
  };
};

const moveCollectionPlaybacks = async (
  playback,
  originCollection,
  targetCollection
) => {
  const originData = await originCollection.find({}).toArray();

  if (!originData.length) {
    console.log("Origin collection is empty");
    throw new Error("Origin collection is empty");
  }

  const now = new Date();
  const userQuery = { user: playback.user };

  for (const originSong of playback.songs) {
    const userTargetData = await targetCollection.findOne(userQuery);

    // move playbacks to target collection
    if (userTargetData) {
      const songExists = userTargetData.songs.some(
        (targetSong) => targetSong.id.toString() === originSong.id.toString()
      );

      if (songExists) {
        await targetCollection.findOneAndUpdate(
          userQuery,
          {
            $push: {
              "songs.$[elem].playbacks": { $each: originSong.playbacks },
            },
          },
          { arrayFilters: [{ "elem.id": originSong.id }] }
        );
      } else {
        await targetCollection.findOneAndUpdate(userQuery, {
          $push: { songs: originSong },
        });
      }
    } else {
      await targetCollection.insertOne({
        user: playback.user,
        songs: [originSong],
        createdAt: now,
        updatedAt: now,
        __v: 0,
      });
    }

    // delete playbacks from origin collection
    await originCollection.findOneAndUpdate(
      { ...userQuery, "songs.id": originSong.id },
      { $set: { "songs.$.playbacks": [] } }
    );
  }
};

const sendSnsNotification = async ({ sns, status, detail, snsTopicArn }) => {
  const msg = {
    Message: JSON.stringify({
      status,
      detail,
    }),
    TopicArn: snsTopicArn,
  };

  try {
    const snsResponse = await sns.publish(msg).promise();
    console.log("SNS publish result:", snsResponse);
  } catch (snsError) {
    console.error("Failed to send SNS notification:", snsError);
  }
};

export {
  getTimePeriod,
  calculatePlaybackStatistics,
  moveCollectionPlaybacks,
  sendSnsNotification,
};
