import mongoose from "mongoose";
import PlaybackStateOptions, {
  PlaybackStateType,
} from "../constants/playback.constant";

export type PlaybackStats = {
  duration: number;
  timestamp: Date;
  state: PlaybackStateType;
};

export interface PlaybackLogDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  song: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId;
  stats: PlaybackStats[];
}

const playbackLogSchema = new mongoose.Schema<PlaybackLogDocument>(
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
    stats: [
      new mongoose.Schema(
        {
          duration: { type: Number, required: true },
          state: {
            type: String,
            enum: [
              PlaybackStateOptions.COMPLETED,
              PlaybackStateOptions.PLAYING,
            ],
            required: true,
          },
          timestamp: { type: Date, required: true },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

const PlaybackLogModel = mongoose.model<PlaybackLogDocument>(
  "Playback",
  playbackLogSchema
);

export default PlaybackLogModel;
