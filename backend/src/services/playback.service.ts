import SongModel from "../models/song.model";
import PlaybackLogModel from "../models/playback.model";
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
  const userPlaybackLog = await PlaybackLogModel.findOne({ user: userId });

  if (userPlaybackLog) {
    // Check if the song already exists in the user's playback log
    const songExists = userPlaybackLog.songs.some(
      (song) => song.id.toString() === songId.toString()
    );

    if (songExists) {
      // If song exists, push new stats to the existing song
      // "$elemMatch" -> find the first song that matches the condition
      // "$" -> refers to the first song that matches the condition
      playbackLog = await PlaybackLogModel.findOneAndUpdate(
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
      playbackLog = await PlaybackLogModel.findOneAndUpdate(
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
    playbackLog = await PlaybackLogModel.create({
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
  const playbackLogs = await PlaybackLogModel.find({});

  return { playbackLogs };
};
