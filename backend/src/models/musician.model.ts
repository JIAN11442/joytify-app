import mongoose from "mongoose";

export interface MusicianDocument extends mongoose.Document {
  name: string;
  roles: string[];
  bio: string;
  imageUrl: string;
  usages: {
    songs: mongoose.Types.ObjectId[];
    users: mongoose.Types.ObjectId[];
  };
  activity: {
    total_follower: number;
  };
}

const musicianSchema = new mongoose.Schema<MusicianDocument>(
  {
    name: { type: String, required: true },
    roles: { type: [String], required: true },
    bio: { type: String },
    imageUrl: { type: String },
    usages: {
      songs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Song",
        index: true,
      },
      users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        index: true,
      },
    },
    activity: {
      total_follower: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const MusicianModel = mongoose.model<MusicianDocument>(
  "Musician",
  musicianSchema
);

export default MusicianModel;
