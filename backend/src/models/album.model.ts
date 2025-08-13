import mongoose from "mongoose";
import { HexPaletee } from "@joytify/shared-types/types";
import { S3_DEFAULT_IMAGES } from "@joytify/shared-types/constants";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

export interface AlbumDocument extends mongoose.Document {
  title: string;
  description: string;
  coverImage: string;
  paletee: HexPaletee;
  artists: mongoose.Types.ObjectId[];
  songs: mongoose.Types.ObjectId[];
  users: mongoose.Types.ObjectId[];
  totalDuration: number;
}

const albumSchema = new mongoose.Schema<AlbumDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String, default: S3_DEFAULT_IMAGES.ALBUM },
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
    },
    artists: { type: [mongoose.Schema.Types.ObjectId], ref: "Musician", index: true },
    songs: { type: [mongoose.Schema.Types.ObjectId], ref: "Song", index: true },
    users: { type: [mongoose.Schema.Types.ObjectId], ref: "User", index: true },
    totalDuration: { type: Number, default: 0 },
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
  await deleteDocWhileFieldsArrayEmpty({
    model: AlbumModel,
    arrayFields: ["artists", "users", "songs"],
  });
});

const AlbumModel = mongoose.model<AlbumDocument>("Album", albumSchema);

export default AlbumModel;
