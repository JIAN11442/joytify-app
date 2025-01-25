import { FilterQuery } from "mongoose";
import PlaybackLogModel, {
  PlaybackLogDocument,
} from "../models/playback.model";
import SongModel from "../models/song.model";
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

export const createOrUpdatePlaybackLog = async (data: CreateParams) => {
  const { userId, songId, ...stats } = data;

  const song = await SongModel.findById(songId);

  appAssert(song, INTERNAL_SERVER_ERROR, "Song not found");

  const params: FilterQuery<PlaybackLogDocument> = {
    user: userId,
    song: songId,
    artist: song.artist,
  };

  // check if playback log exists
  const playbackLog = await PlaybackLogModel.findOne(params);

  // if playback log exists, push new logs
  if (playbackLog) {
    const updatePlaybackLog = await PlaybackLogModel.findOneAndUpdate(params, {
      $push: { stats: { ...stats } },
    });

    appAssert(
      updatePlaybackLog,
      INTERNAL_SERVER_ERROR,
      "Failed to update playback log"
    );
  }
  // if playback log does not exist, create new playback log
  else {
    const newPlaybackLog = await PlaybackLogModel.create({
      ...params,
      stats: { ...stats },
    });

    appAssert(
      newPlaybackLog,
      INTERNAL_SERVER_ERROR,
      "Failed to create playback log"
    );
  }

  return { playbackLog };
};
