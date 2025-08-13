import { RequestHandler } from "express";

import {
  createLabel,
  getLabelById,
  getLabelId,
  getLabels,
  removeLabel,
} from "../services/label.service";
import {
  createLabelZodSchema,
  getLabelsZodSchema,
  getLabelIdZodSchema,
} from "../schemas/label.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateLabelRequest, GetLabelIdRequest } from "@joytify/shared-types/types";

const { OK, CREATED } = HttpCode;

// get all labels handler
export const getLabelsHandler: RequestHandler = async (req, res, next) => {
  try {
    const queries = req.query;
    const userId = objectIdZodSchema.parse(req.userId);
    const params = getLabelsZodSchema.parse({
      types: queries.types,
      sortBySequence: queries.sort_by_sequence,
    });

    const { labels } = await getLabels({ userId, ...params });

    res.status(OK).json(labels);
  } catch (error) {
    next(error);
  }
};

// get label id handler
export const getLabelIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const params: GetLabelIdRequest = getLabelIdZodSchema.parse(req.query);

    const { id } = await getLabelId(params);

    return res.status(OK).json(id);
  } catch (error) {
    next(error);
  }
};

// get label by id handler
export const getLabelByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const labelId = objectIdZodSchema.parse(req.params.labelId);

    const { label } = await getLabelById(labelId);

    return res.status(OK).json(label);
  } catch (error) {
    next(error);
  }
};

// create label handler
export const createLabelHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: CreateLabelRequest = createLabelZodSchema.parse(req.body);

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
    const labelId = objectIdZodSchema.parse(req.params.labelId);

    const { removedLabel } = await removeLabel({ userId, id: labelId });

    return res.status(OK).json(removedLabel);
  } catch (error) {
    next(error);
  }
};
