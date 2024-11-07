import { RequestHandler } from "express";

import { labelSchema, labelsSchema } from "../schemas/label.schema";
import { verificationCodeSchema } from "../schemas/auth.schema";

import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constants/http-code.constant";
import {
  createLabel,
  deleteLabel,
  getDefaultAndCreatedLabel,
  getLabelId,
} from "../services/label.service";
import appAssert from "../utils/app-assert.util";

// get all labels handler
export const getUserLabelsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);

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
    const userId = verificationCodeSchema.parse(req.userId);
    const { label, type } = labelSchema.parse(req.body);

    const { createdLabel } = await createLabel({ userId, label, type });

    return res.status(CREATED).json({ label: createdLabel });
  } catch (error) {
    next(error);
  }
};

// get label ID handler
export const getLabelIdsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const { labels, type, createIfAbsent } = labelsSchema.parse(req.body);

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
    const userId = verificationCodeSchema.parse(req.userId);
    const id = verificationCodeSchema.parse(req.params.id);

    await deleteLabel({ userId, id });

    res.status(OK).json({ message: "Label deleted" });
  } catch (error) {
    next(error);
  }
};
