import mongoose from "mongoose";
import LabelOptions from "../constants/label.constant";
import defaultLabels from "../seeds/label.seed";

export interface LabelDocument extends mongoose.Document {
  label: string;
  type: LabelOptions;
  author: mongoose.Types.ObjectId;
  songs: mongoose.Types.ObjectId[];
  default: boolean;
}

const labelSchema = new mongoose.Schema<LabelDocument>(
  {
    label: { type: String, required: true },
    type: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
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

// while save, check the default label with seed file
// labelSchema.pre("save", async function (next) {
//   try {
//     const existLabels = await LabelModel.find(
//       { default: true },
//       "label type default"
//     );

//     const generateExistLabels = new Set(
//       existLabels.map((label) => `${label.label}|${label.type}`)
//     );

//     // If a label from the default file does not exist in the database,
//     // That is the data we want to add.
//     const labelsToInsert = defaultLabels.filter(
//       (defaultLabel) =>
//         !generateExistLabels.has(`${defaultLabel.label}|${defaultLabel.type}`)
//     );

//     if (labelsToInsert.length > 0) {
//       await LabelModel.insertMany(labelsToInsert);
//     }

//     next();
//   } catch (error) {
//     console.log(error);
//   }
// });

// export const initializeLabel = async () => {
//   try {
//     const existLabels = await LabelModel.find(
//       { default: true },
//       "label type default"
//     );

//     const generateExistLabels = new Set(
//       existLabels.map((label) => `${label.label}|${label.type}`)
//     );

//     // If a label from the default file does not exist in the database,
//     // That is the data we want to add.
//     const labelsToInsert = defaultLabels.filter(
//       (defaultLabel) =>
//         !generateExistLabels.has(`${defaultLabel.label}|${defaultLabel.type}`)
//     );

//     if (labelsToInsert.length > 0) {
//       await LabelModel.insertMany(labelsToInsert);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const LabelModel = mongoose.model<LabelDocument>("Label", labelSchema);

export default LabelModel;
