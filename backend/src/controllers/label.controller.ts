import { RequestHandler } from "express";

import {
  createLabel,
  deleteLabel,
  getDefaultAndCreatedLabel,
  getLabelId,
} from "../services/label.service";
import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constants/http-code.constant";
import { objectIdZodSchema } from "../schemas/util.zod";
import { labelZodSchema, labelsZodSchema } from "../schemas/label.zod";
import appAssert from "../utils/app-assert.util";

// get all labels handler
export const getUserLabelsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);

    const { labels } = await getDefaultAndCreatedLabel(userId);

    appAssert(
      labels,
      INTERNAL_SERVER_ERROR,
      "Failed to get user label options"
    );

    res.status(OK).json(labels);
  } catch (error) {
    next(error);
  }
};

// create label handler
export const createLabelHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { label, type } = labelZodSchema.parse(req.body);

    const { createdLabel } = await createLabel({ userId, label, type });

    return res.status(CREATED).json(createdLabel);
  } catch (error) {
    next(error);
  }
};

// get label ID handler
export const getLabelIdsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { labels, type, createIfAbsent } = labelsZodSchema.parse(req.body);

    const labelIds = await Promise.all(
      labels?.map(async (label) => {
        const { id } = await getLabelId({
          userId,
          label,
          type,
          createIfAbsent,
        });

        return id;
      }) || []
    );

    return res.status(OK).json(labelIds);
  } catch (error) {
    next(error);
  }
};

// delete label handler
export const deleteLabelHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const id = objectIdZodSchema.parse(req.params.id);

    const { deletedLabel } = await deleteLabel({ userId, id });

    return res.status(OK).json(deletedLabel);
  } catch (error) {
    next(error);
  }
};
