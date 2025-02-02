import mongoose from "mongoose";
import { PlaybackSong } from "./playback.model";
import PlaybackStateOptions from "../constants/playback.constant";

export interface HistoryDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  songs: PlaybackSong[];
}

const historySchema = new mongoose.Schema<HistoryDocument>({
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
});

const HistoryModel = mongoose.model<HistoryDocument>("History", historySchema);

export default HistoryModel;
