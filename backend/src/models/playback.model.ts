import mongoose, { UpdateQuery } from "mongoose";
import { refreshSongPlaybackStats } from "../services/song.service";
import { PlaybackStateOptions } from "@joytify/shared-types/constants";

export interface PlaybackDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  song: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId;
  state: String;
  duration: Number;
  createdAt: Date;
  updatedAt: Date;
}

const { COMPLETED, PLAYING } = PlaybackStateOptions;

const playbackSchema = new mongoose.Schema<PlaybackDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      index: true,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Musician",
      index: true,
      required: true,
    },
    state: {
      type: String,
      enum: [COMPLETED, PLAYING],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [0.001, "Duration must be greater than 0"],
    },
  },
  { timestamps: true }
);

// after save playback, ...
playbackSchema.post("save", async function (doc) {
  try {
    const songId = doc.song.toString();

    if (songId && !this.isModified("song")) {
      await refreshSongPlaybackStats(songId);
    }
  } catch (error) {
    console.log(error);
  }
});

// after created playback, ...
playbackSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) {
      return;
    }

    const query = this.getQuery();
    const update = this.getUpdate() as UpdateQuery<PlaybackDocument>;

    const songId =
      query.songs && query.songs.$elemMatch
        ? query.songs.$elemMatch.id
        : update && update.$push && update.$push.songs
          ? update.$push.songs.id
          : null;

    if (songId !== null) {
      await refreshSongPlaybackStats(songId.toString());
    }
  } catch (error) {
    console.log(error);
  }
});

const PlaybackModel = mongoose.model<PlaybackDocument>("Playback", playbackSchema);

export default PlaybackModel;
