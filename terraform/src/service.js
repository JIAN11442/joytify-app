const { ObjectId } = require("mongodb");

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

const calculatePlaybackStatistics = (data, sorting = "desc") => {
  // get user song durations
  const getSongDurations = () => {
    const stats = data.songs.map((song) => {
      const totalDuration = song.playbacks.reduce(
        (acc, playback) => acc + playback.duration,
        0
      );

      return {
        song: song.id,
        totalDuration: parseFloat(totalDuration.toFixed(2)),
      };
    });

    const songStats = stats.sort((a, b) =>
      sorting === "desc"
        ? b.totalDuration - a.totalDuration
        : a.totalDuration - b.totalDuration
    );

    return songStats;
  };

  // get user artist durations
  const getArtistDurations = () => {
    const stats = data.songs.reduce((acc, song) => {
      // sum up the duration of song
      const totalDuration = song.playbacks.reduce(
        (acc, playback) => acc + playback.duration,
        0
      );

      // if the artist is not in the acc, create a new entry
      if (!acc[song.artist]) {
        acc[song.artist] = totalDuration;
      } else {
        // otherwise, add the total duration to the artist
        acc[song.artist] += totalDuration;
      }

      return acc;
    }, {});

    const artistStats = Object.entries(stats)
      .map(([artist, duration]) => ({
        artist: new ObjectId(artist),
        totalDuration: parseFloat(duration.toFixed(2)),
      }))
      .sort((a, b) =>
        sorting === "desc"
          ? b.totalDuration - a.totalDuration
          : a.totalDuration - b.totalDuration
      );

    return artistStats;
  };

  // get user playback peak hour
  const getPlaybackPeakHour = () => {
    const hourlyTimestampDurations = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      totalDuration: 0,
      utilization: 0,
    }));

    data.songs.forEach((song) =>
      song.playbacks.forEach((playback) => {
        const playbackHour = new Date(playback.timestamp).getHours();

        const targetHour = hourlyTimestampDurations[playbackHour];

        targetHour.totalDuration += playback.duration;
        targetHour.totalDuration = parseFloat(
          targetHour.totalDuration.toFixed(2)
        );
        targetHour.utilization = parseFloat(
          ((targetHour.totalDuration / (60 * 60)) * 100).toFixed(2)
        );
      })
    );

    return hourlyTimestampDurations;
  };

  return {
    songStats: getSongDurations(),
    artistStats: getArtistDurations(),
    peakHourStats: getPlaybackPeakHour(),
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

module.exports = {
  getTimePeriod,
  calculatePlaybackStatistics,
  moveCollectionPlaybacks,
};
