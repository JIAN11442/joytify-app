import mongoose from "mongoose";
import PlaybackStateOptions, {
  PlaybackStateType,
} from "../constants/playback.constant";

export type PlaybackStats = {
  duration: number;
  state: PlaybackStateType;
  timestamp: Date;
};

export type PlaybackSong = {
  id: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId;
  playbacks: PlaybackStats[];
};

export interface PlaybackLogDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  songs: PlaybackSong[];
}

const playbackLogSchema = new mongoose.Schema<PlaybackLogDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    songs: [
      new mongoose.Schema(
        {
          id: {
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
          playbacks: [
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
