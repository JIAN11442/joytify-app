import mongoose from "mongoose";

type SongStats = {
  song: mongoose.Types.ObjectId;
  totalDuration: number;
};

type ArtistStats = {
  artist: mongoose.Types.ObjectId;
  totalDuration: number;
};

type PeakHourStats = {
  hour: number;
  totalDuration: number;
  utilization: number;
};

type MonthlySummaryStats = {
  month: number;
  year: number;
  totalDuration: number;
  growthPercentage: number;
  topArtist: string;
  topArtistTotalPlaybackTime: number;
};

export type UserStats = {
  songs: SongStats[];
  artists: ArtistStats[];
  peakHour: PeakHourStats[];
  summary: MonthlySummaryStats[];
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
            new mongoose.Schema(
              {
                song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
                totalDuration: { type: Number, required: true },
              },
              { _id: false }
            ),
          ],
          artists: [
            new mongoose.Schema(
              {
                artist: { type: mongoose.Schema.Types.ObjectId, ref: "Musician" },
                totalDuration: { type: Number, required: true },
              },
              { _id: false }
            ),
          ],
          peakHour: [
            new mongoose.Schema(
              {
                hour: { type: Number, required: true },
                totalDuration: { type: Number, required: true },
                utilization: { type: Number, required: true },
              },
              { _id: false }
            ),
          ],
          summary: new mongoose.Schema(
            {
              month: { type: Number, required: true },
              year: { type: Number, required: true },
              totalDuration: { type: Number, required: true, default: 0 },
              growthPercentage: { type: Number, required: true, default: 0 },
              topArtist: { type: String, required: true },
              topArtistTotalPlaybackTime: { type: Number, required: true, default: 0 },
            },
            { _id: false }
          ),
        },
        { timestamps: true, _id: false }
      ),
    ],
  },
  { timestamps: true }
);

const StatsModel = mongoose.model<StatsDocument>("Stats", statsSchema);

export default StatsModel;
