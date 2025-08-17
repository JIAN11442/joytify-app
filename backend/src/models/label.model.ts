import mongoose from "mongoose";
import { LabelOptions, S3_DEFAULT_IMAGES } from "@joytify/shared-types/constants";
import { HexPaletee } from "@joytify/shared-types/types";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

export interface LabelDocument extends mongoose.Document {
  label: string;
  type: LabelOptions;
  coverImage: string;
  paletee: HexPaletee;
  author: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  songs: mongoose.Types.ObjectId[];
  default: boolean;
}

const labelSchema = new mongoose.Schema<LabelDocument>(
  {
    label: { type: String, required: true },
    type: { type: String, required: true },
    coverImage: { type: String },
    paletee: {
      vibrant: { type: String },
      darkVibrant: { type: String },
      lightVibrant: { type: String },
      muted: { type: String },
      darkMuted: { type: String },
      lightMuted: { type: String },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      index: true,
    },
    songs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
      index: true,
    },
    default: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// before create label,...
labelSchema.pre("save", async function (next) {
  if (!this.coverImage) {
    switch (this.type) {
      case "genre":
        this.coverImage = S3_DEFAULT_IMAGES.LABEL_GENRE;
        break;
      case "language":
        this.coverImage = S3_DEFAULT_IMAGES.LABEL_LANGUAGE;
        break;
      case "tag":
        this.coverImage = S3_DEFAULT_IMAGES.LABEL_TAG;
        break;
      default:
        this.coverImage = S3_DEFAULT_IMAGES.LABEL_OTHER;
        break;
    }
  }

  next();
});

// after update label,...
labelSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) {
    return;
  }

  const { users, songs } = doc;

  // delete non-default label if no users and songs
  if (!doc.default && users.length === 0 && songs.length === 0) {
    await doc.deleteOne();
  }
});

// after update many labels,...
labelSchema.post("updateMany", async function (doc) {
  if (!doc || !doc.modifiedCount) {
    return;
  }

  // delete labels with no users and songs
  await deleteDocWhileFieldsArrayEmpty({
    model: LabelModel,
    filter: { default: false },
    arrayFields: ["users", "songs"],
  });
});

const LabelModel = mongoose.model<LabelDocument>("Label", labelSchema);

export default LabelModel;
