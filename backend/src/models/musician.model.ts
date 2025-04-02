import mongoose from "mongoose";
import { deleteDocWhileFieldsArrayEmpty } from "../utils/mongoose.util";

export interface MusicianDocument extends mongoose.Document {
  name: string;
  roles: string[];
  bio: string;
  cover_image: string;
  songs: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  activity: {
    total_follower: number;
  };
}

const musicianSchema = new mongoose.Schema<MusicianDocument>(
  {
    name: { type: String, required: true },
    roles: { type: [String], required: true },
    bio: { type: String },
    cover_image: {
      type: String,
      default:
        "https://mern-joytify-bucket-yj.s3.ap-northeast-1.amazonaws.com/defaults/default-album-image.png",
    },
    songs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Song",
      index: true,
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      index: true,
    },
    activity: {
      total_follower: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// // after update many musicians,...
musicianSchema.post("updateMany", async function (doc) {
  if (!doc || !doc.modifiedCount) {
    return;
  }

  // delete musicians with no songs and followers
  await deleteDocWhileFieldsArrayEmpty({
    model: MusicianModel,
    arrayFields: ["songs", "followers"],
  });
});

const MusicianModel = mongoose.model<MusicianDocument>("Musician", musicianSchema);

export default MusicianModel;
