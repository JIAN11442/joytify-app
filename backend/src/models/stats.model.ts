import mongoose from "mongoose";

export type SongStats = {
  song: mongoose.Types.ObjectId;
  totalDuration: number;
};

export type ArtistStats = {
  artist: mongoose.Types.ObjectId;
  totalDuration: number;
};

export type PeakHourStats = {
  hour: number;
  totalDuration: number;
  utilization: number;
};

export type UserStats = {
  songs: SongStats[];
  artists: ArtistStats[];
  peakHour: PeakHourStats[];
};

export interface StatsDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  stats: UserStats[];
}

const statsSchema = new mongoose.Schema<StatsDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    stats: [
      new mongoose.Schema(
        {
          songs: [
            new mongoose.Schema({
              song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
              totalDuration: { type: Number, required: true },
            }),
            { _id: false },
          ],
          artists: [
            new mongoose.Schema({
              artist: { type: mongoose.Schema.Types.ObjectId, ref: "Musician" },
              totalDuration: { type: Number, required: true },
            }),
            { _id: false },
          ],
          peakHour: [
            new mongoose.Schema({
              hour: { type: Number, required: true },
              totalDuration: { type: Number, required: true },
              utilization: { type: Number, required: true },
            }),
            { _id: false },
          ],
        },
        { timestamps: true }
      ),
    ],
  },
  { timestamps: true }
);

const StatsModel = mongoose.model<StatsDocument>("Stats", statsSchema);

export default StatsModel;
