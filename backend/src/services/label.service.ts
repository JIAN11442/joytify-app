import mongoose, { FilterQuery } from "mongoose";
import LabelModel, { LabelDocument } from "../models/label.model";
import { LabelType } from "../constants/label-type.constant";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";

// get labels service
export const getDefaultAndCreatedLabel = async (userId: string) => {
  const groupLabels = (isDefault: boolean, userId?: string) => [
    // Match labels based on default status
    {
      $match: {
        default: isDefault,
        ...(userId ? { author: new mongoose.Types.ObjectId(userId) } : {}),
      },
    },
    // Group labels by their type and collect them into a set
    {
      $group: {
        _id: "$type",
        labels: { $addToSet: { id: "$_id", label: "$label" } },
      },
    },
    // Project to sort labels alphabetically by their label property
    {
      $project: {
        _id: 1,
        labels: {
          $sortArray: { input: "$labels", sortBy: { label: 1 } },
        },
      },
    },
    // Group all sorted labels into a single object
    {
      $group: {
        _id: null,
        result: { $push: { k: "$_id", v: "$labels" } },
      },
    },
    // Replace the root with the new object structure
    {
      $replaceRoot: {
        newRoot: { $arrayToObject: "$result" },
      },
    },
  ];

  const labels = await LabelModel.aggregate([
    {
      $facet: {
        default: groupLabels(true),
        created: groupLabels(false, userId),
      },
    },
    // Optionally project to format the final output (commented out)
    {
      $project: {
        default: { $arrayElemAt: ["$default", 0] },
        created: {
          $ifNull: [{ $arrayElemAt: ["$created", 0] }, null],
        },
      },
    },
  ]);

  return { labels: labels[0] };
};

interface createLabelProps {
  userId: string;
  label: string;
  type: LabelType;
}

// create label service
export const createLabel = async (data: createLabelProps) => {
  const { userId, label, type } = data;

  const findQuery: FilterQuery<LabelDocument> = {
    label,
    type,
    author: userId,
    default: false,
  };

  const isLabelExist = await LabelModel.exists(findQuery);

  appAssert(!isLabelExist, CONFLICT, "Each label already exists");

  const createdLabel = await LabelModel.create(findQuery);

  appAssert(
    createdLabel,
    INTERNAL_SERVER_ERROR,
    "Failed to create the new label"
  );

  return { createdLabel };
};

interface deleteLabelProps extends createLabelProps {
  id: string;
}

// delete label service
export const deleteLabel = async (data: deleteLabelProps) => {
  const { id, userId, label, type } = data;

  const findQuery: FilterQuery<LabelDocument> = {
    _id: id,
    label,
    type,
    author: userId,
    default: false,
  };

  const isLabelExist = await LabelModel.exists(findQuery);

  appAssert(isLabelExist, NOT_FOUND, "Label to be deleted is not found");

  const deletedLabel = await LabelModel.findOneAndDelete(findQuery);

  appAssert(
    deletedLabel,
    INTERNAL_SERVER_ERROR,
    "Failed to delete target label"
  );

  return { deletedLabel };
};
