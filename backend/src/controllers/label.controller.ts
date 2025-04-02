import { RequestHandler } from "express";

import { createLabel, getLabelId, getLabels, removeLabel } from "../services/label.service";
import { labelZodSchema, labelsZodSchema } from "../schemas/label.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateLabelRequest, GetLabelsIdRequest } from "@joytify/shared-types/types";
import appAssert from "../utils/app-assert.util";

const { OK, CREATED, INTERNAL_SERVER_ERROR } = HttpCode;

// get all labels handler
export const getUserLabelsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);

    const { labels } = await getLabels(userId);

    appAssert(labels, INTERNAL_SERVER_ERROR, "Failed to get user label options");

    res.status(OK).json(labels);
  } catch (error) {
    next(error);
  }
};

// create label handler
export const createLabelHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: CreateLabelRequest = labelZodSchema.parse(req.body);

    const { label } = await createLabel({ userId, ...params });

    return res.status(CREATED).json(label);
  } catch (error) {
    next(error);
  }
};

// remove label handler
export const removeLabelHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const id = objectIdZodSchema.parse(req.params.id);

    const { removedLabel } = await removeLabel({ userId, id });

    return res.status(OK).json(removedLabel);
  } catch (error) {
    next(error);
  }
};

// get labels id handler(*)
export const getLabelsIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { labels, ...rest }: GetLabelsIdRequest = labelsZodSchema.parse(req.body);

    const labelIds = await Promise.all(
      labels?.map(async (label) => {
        const { id } = await getLabelId({ userId, label, ...rest });

        return id;
      }) || []
    );

    return res.status(OK).json(labelIds);
  } catch (error) {
    next(error);
  }
};
