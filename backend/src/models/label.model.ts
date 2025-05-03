import mongoose from "mongoose";
import { LabelOptions } from "@joytify/shared-types/constants";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

export interface LabelDocument extends mongoose.Document {
  label: string;
  type: LabelOptions;
  index: number;
  author: mongoose.Types.ObjectId;
  users: mongoose.Types.ObjectId[];
  songs: mongoose.Types.ObjectId[];
  default: boolean;
}

const labelSchema = new mongoose.Schema<LabelDocument>(
  {
    label: { type: String, required: true },
    type: { type: String, required: true },
    index: { type: Number },
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
