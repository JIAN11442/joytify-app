import mongoose, { FilterQuery } from "mongoose";

import LabelModel, { LabelDocument } from "../models/label.model";
import { HttpCode } from "@joytify/types/constants";
import {
  CreateLabelRequest,
  GetLabelIdRequest,
  LabelOptionsType,
  PopulatedSearchLabelResponse,
  RefactorSearchLabelResponse,
} from "@joytify/types/types";
import appAssert from "../utils/app-assert.util";
import { PROFILE_FETCH_LIMIT } from "../constants/env-validate.constant";

type GetLabelsServiceRequest = {
  userId: string;
  types?: LabelOptionsType[];
  sortBySequence?: boolean;
};

interface CreateLabelServiceRequest extends CreateLabelRequest {
  userId: string;
}

type RemoveLabelRequest = {
  id: string;
  userId: string;
};

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpCode;

// get label ID service
export const getLabelId = async (params: GetLabelIdRequest) => {
  const { label: doc, type, default: isDefault, createIfAbsent } = params;

  const findQuery: FilterQuery<LabelDocument> = {
    type,
    label: doc,
    default: isDefault,
  };

  // find label if exist
  let label = await LabelModel.findOne(findQuery);

  // if not found, create and replace label
  if (!label && createIfAbsent) {
    label = await LabelModel.create({ ...findQuery });

    appAssert(label, INTERNAL_SERVER_ERROR, "Failed to create label");
  }

  // if label still not found, return error
  appAssert(label, NOT_FOUND, "Label is not found");

  return { id: label._id };
};

// get all labels service
export const getLabels = async (params: GetLabelsServiceRequest) => {
  const { userId, types, sortBySequence } = params;

  const groupLabels = (isDefault: boolean, userId?: string) => [
    // Match labels based on default status
    {
      $match: {
        default: isDefault,
        ...(types && types.length > 0 ? { type: { $in: types } } : {}),
        ...(userId ? { users: new mongoose.Types.ObjectId(userId) } : {}),
      },
    },
    // Group labels by their type and collect them into a set
    {
      $group: {
        _id: "$type",
        labels: { $addToSet: { id: "$_id", label: "$label", index: "$index" } },
      },
    },
    // Project to sort labels by alphabetically or index
    {
      $project: {
        _id: 1,
        labels: {
          $sortArray: {
            input: "$labels",
            sortBy: sortBySequence ? { index: 1 } : { label: 1 },
          },
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

  return { labels: labels[0] || {} };
};

// get label by id service
export const getLabelById = async (id: string) => {
  const label = await LabelModel.findById(id)
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedSearchLabelResponse>({ transformNestedSongs: true })
    .lean<RefactorSearchLabelResponse>();

  return { label };
};

// get recommended labels service
export const getRecommendedLabels = async (labelId: string) => {
  const label = await LabelModel.findById(labelId);

  appAssert(label, NOT_FOUND, "Label is not found");

  const recommendedLabels = await LabelModel.find({
    _id: { $ne: labelId },
    type: label.type,
    songs: { $ne: [] },
  })
    .limit(PROFILE_FETCH_LIMIT)
    .populateNestedSongDetails()
    .refactorSongFields<PopulatedSearchLabelResponse>({ transformNestedSongs: true })
    .lean<RefactorSearchLabelResponse>();

  return recommendedLabels;
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
