import mongoose from "mongoose";

export interface AlbumDocument extends mongoose.Document {
  title: string;
  description: string;
  cover_image: string;
  artist: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
  users: mongoose.Types.ObjectId[];
  total_duration: number;
}

const albumSchema = new mongoose.Schema<AlbumDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    cover_image: {
      type: String,
      default:
        "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/default-song-album.png",
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Musician",
      index: true,
    },
    songs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
    users: { type: [mongoose.Schema.Types.ObjectId], ref: "User", index: true },
    total_duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AlbumModel = mongoose.model<AlbumDocument>("Album", albumSchema);

export default AlbumModel;
