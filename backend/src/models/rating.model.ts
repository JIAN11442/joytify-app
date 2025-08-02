import mongoose from "mongoose";
import { RatingTypeOptions } from "@joytify/shared-types/constants";
import { RatingType } from "@joytify/shared-types/types";

export interface RatingDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  song: mongoose.Types.ObjectId;
  type: RatingType;
  rating: number;
  comment: string;
}

const ratingSchema = new mongoose.Schema<RatingDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", index: true },
    type: { type: String, enum: RatingTypeOptions, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 0 },
    comment: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

const RatingModel = mongoose.model<RatingDocument>("Rating", ratingSchema);

export default RatingModel;
