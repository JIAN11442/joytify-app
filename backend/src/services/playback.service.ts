import SongModel from "../models/song.model";
import PlaybackModel from "../models/playback.model";
import { trackPlaybackStats } from "./stats.service";
import { HttpCode } from "@joytify/types/constants";
import { CreatePlaybackLogRequest } from "@joytify/types/types";
import appAssert from "../utils/app-assert.util";

interface CreatePlaybackLogServiceRequest extends CreatePlaybackLogRequest {
  userId: string;
}

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

export const createPlaybackLog = async (data: CreatePlaybackLogServiceRequest) => {
  const { userId, songId, duration, state } = data;

  // 1. if duration is less than or equal to 0, return
  if (duration <= 0) {
    return { playbackLog: null };
  }

  // 2. check if song exists
  const song = await SongModel.findById(songId);

  appAssert(song, NOT_FOUND, "Song not found");

  // 3. get artist id
  const artistId = song.artist;

  // 4. create playback log
  const playbackLog = await PlaybackModel.create({
    user: userId,
    artist: artistId,
    song: songId,
    state,
    duration,
  });

  appAssert(playbackLog, INTERNAL_SERVER_ERROR, "Failed to create playback log");

  // 5. track playback stats
  await trackPlaybackStats({
    userId,
    songId,
    artistId,
    duration,
    timestamp: playbackLog.createdAt,
  });

  return { playbackLog };
};

