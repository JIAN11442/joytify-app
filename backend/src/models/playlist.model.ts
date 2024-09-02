import mongoose from "mongoose";

export interface PlaylistDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  cover_image: string;
  songs: mongoose.Types.ObjectId[];
  default: boolean;
}

const playlistSchema = new mongoose.Schema<PlaylistDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  cover_image: {
    type: String,
    default:
      "https://mern-joytify.s3.ap-southeast-1.amazonaws.com/defaults/default_img.png",
  },
  songs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
  default: { type: Boolean, default: false },
});

const PlaylistModel = mongoose.model<PlaylistDocument>(
  "Playlist",
  playlistSchema
);

export default PlaylistModel;
