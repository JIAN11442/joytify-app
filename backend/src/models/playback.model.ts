import mongoose, { UpdateQuery } from "mongoose";

import { refreshSongPlaybackStats } from "../services/song.service";
import { PlaybackStateOptions } from "@joytify/shared-types/constants";
import { PlaybackSong } from "@joytify/shared-types/types";

export interface PlaybackDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  songs: PlaybackSong[];
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
                  enum: [COMPLETED, PLAYING],
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

// after save playback, ...
playbackSchema.post("save", async function (doc) {
  try {
    const songId = doc.songs[0].id;

    if (songId && !this.isModified("songs")) {
      await refreshSongPlaybackStats(songId.toString());
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
