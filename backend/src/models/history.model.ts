import mongoose from "mongoose";
import { PlaybackStateOptions } from "@joytify/shared-types/constants";

export interface HistoryDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  song: mongoose.Types.ObjectId;
  artist: mongoose.Types.ObjectId;
  state: String;
  duration: Number;
}

const { COMPLETED, PLAYING } = PlaybackStateOptions;

const historySchema = new mongoose.Schema<HistoryDocument>(
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
    duration: { type: Number, required: true },
  },
  { timestamps: true }
);

const HistoryModel = mongoose.model<HistoryDocument>("History", historySchema);

export default HistoryModel;
