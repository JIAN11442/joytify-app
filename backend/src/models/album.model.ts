import mongoose from "mongoose";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

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
        "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/default-album-image.png",
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

// after update album,...
albumSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) {
    return;
  }

  const { users, songs } = doc;

  // if there are no users and songs, delete the album
  if (users.length === 0 && songs.length === 0) {
    await doc.deleteOne();
  }
});

// after update album,...
albumSchema.post("updateMany", async function (doc) {
  // if nothing updated, return
  if (!doc || !doc.modifiedCount) {
    return;
  }

  // delete albums with no users and songs
  await deleteDocWhileFieldsArrayEmpty({ model: AlbumModel, arrayFields: ["users", "songs"] });
});

const AlbumModel = mongoose.model<AlbumDocument>("Album", albumSchema);

export default AlbumModel;
