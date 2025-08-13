import mongoose from "mongoose";
import usePalette from "../hooks/paletee.hook";
import { HexPaletee } from "@joytify/shared-types/types";
import { S3_DEFAULT_IMAGES } from "@joytify/shared-types/constants";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

export interface MusicianDocument extends mongoose.Document {
  name: string;
  roles: string[];
  bio: string;
  coverImage: string;
  paletee: HexPaletee;
  songs: mongoose.Types.ObjectId[];
  albums: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
}

const musicianSchema = new mongoose.Schema<MusicianDocument>(
  {
    name: { type: String, required: true },
    roles: { type: [String], required: true },
    bio: { type: String },
    coverImage: { type: String, default: S3_DEFAULT_IMAGES.MUSICIAN },
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
    },
    songs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
      index: true,
    },
    albums: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Album",
      index: true,
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

// before create musician, ...
musicianSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (this.coverImage) {
      this.paletee = await usePalette(this.coverImage);
    }
  }

  next();
});

// // after update many musicians,...
musicianSchema.post("updateMany", async function (doc) {
  if (!doc || !doc.modifiedCount) {
    return;
  }

  // delete musicians with no songs and followers
  await deleteDocWhileFieldsArrayEmpty({
    model: MusicianModel,
    arrayFields: ["songs", "albums", "followers"],
  });
});

const MusicianModel = mongoose.model<MusicianDocument>("Musician", musicianSchema);

export default MusicianModel;
