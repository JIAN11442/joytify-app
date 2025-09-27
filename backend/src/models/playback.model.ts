import mongoose from "mongoose";
import { PlaybackStateOptions } from "@joytify/types/constants";
import SongModel from "./song.model";

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

// Add post save middleware before creating the model
playbackSchema.post("save", async function (doc) {
  try {
    const { song, duration } = doc;

    // Get current song statistics
    const currentSong = await SongModel.findById(song);
    if (!currentSong) return;

    const currentCount = currentSong.activities?.totalPlaybackCount || 0;
    const currentTotalDuration = currentSong.activities?.totalPlaybackDuration || 0;

    // Calculate new statistics
    const newCount = currentCount + 1;
    const newTotalDuration = currentTotalDuration + Number(duration);

    // Calculate weighted average duration
    // Formula: (previous_weighted_avg * previous_total_duration + new_duration^2) / new_total_duration
    const currentWeightedAvg = currentSong.activities?.weightedAveragePlaybackDuration || 0;
    const previousWeightedSum = currentWeightedAvg * currentTotalDuration;
    const newWeightedAvg =
      newTotalDuration > 0
        ? (previousWeightedSum + Number(duration) * Number(duration)) / newTotalDuration
        : 0;

    // Update song statistics
    await SongModel.findByIdAndUpdate(song, {
      "activities.totalPlaybackCount": newCount,
      "activities.totalPlaybackDuration": newTotalDuration,
      "activities.weightedAveragePlaybackDuration": newWeightedAvg,
    });
  } catch (error) {
    console.log(error);
  }
});

const PlaybackModel = mongoose.model<PlaybackDocument>("Playback", playbackSchema);

export default PlaybackModel;
