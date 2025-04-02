import mongoose, { FilterQuery } from "mongoose";

import LabelModel, { LabelDocument } from "../models/label.model";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateLabelRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

interface CreateLabelServiceRequest extends CreateLabelRequest {
  userId: string;
}

interface GetLabelIdServiceRequest extends CreateLabelServiceRequest {
  createIfAbsent?: boolean;
}

type RemoveLabelRequest = {
  id: string;
  userId: string;
};

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get labels service
export const getLabels = async (userId: string) => {
  const groupLabels = (isDefault: boolean, userId?: string) => [
    // Match labels based on default status
    {
      $match: {
        default: isDefault,
        ...(userId ? { users: new mongoose.Types.ObjectId(userId) } : {}),
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

// create label service
export const createLabel = async (params: CreateLabelServiceRequest) => {
  const { userId, label, type } = params;

  const findQuery: FilterQuery<LabelDocument> = { label, type };

  // check if label is already exist
  let labelDoc = await LabelModel.findOne(findQuery);

  if (labelDoc) {
    // update users params
    labelDoc = await LabelModel.findOneAndUpdate(
      findQuery,
      { $addToSet: { users: userId } },
      { new: true }
    );
  } else {
    labelDoc = await LabelModel.create({
      ...findQuery,
      author: userId,
      users: userId,
      default: false,
    });
  }

  appAssert(labelDoc, INTERNAL_SERVER_ERROR, "Failed to create label");

  return { label: labelDoc };
};

// remove label service
export const removeLabel = async (data: RemoveLabelRequest) => {
  const { id, userId } = data;

  const removedLabel = await LabelModel.findOneAndUpdate(
    { _id: id, default: false },
    { $pull: { users: userId } },
    { new: true }
  );

  appAssert(removedLabel, NOT_FOUND, "Label is not found");

  return { removedLabel };
};

// get label ID service(*)
export const getLabelId = async (params: GetLabelIdServiceRequest) => {
  const { userId, label: doc, type, createIfAbsent } = params;

  const findQuery: FilterQuery<LabelDocument> = {
    type,
    label: doc,
    default: false,
  };

  // find label if exist
  let label = await LabelModel.findOne(findQuery);

  // if not found, create and replace label
  if (!label && createIfAbsent) {
    label = await LabelModel.create({
      ...findQuery,
      author: userId,
    });

    appAssert(label, INTERNAL_SERVER_ERROR, "Failed to create label");
  }

  // if label still not found, return error
  appAssert(label, NOT_FOUND, "Label is not found");

  return { id: label._id };
};
