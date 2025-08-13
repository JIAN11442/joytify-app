import { RequestHandler } from "express";
import { searchParamsZodSchema, searchQueryZodSchema } from "../schemas/search.zod";
import { searchContentByType } from "../services/search.service";
import { HttpCode } from "@joytify/shared-types/constants";

const { OK } = HttpCode;

export const getSearchContentByTypeHandler: RequestHandler = async (req, res, next) => {
  try {
    const { type } = searchParamsZodSchema.parse(req.params);
    const { query, page } = searchQueryZodSchema.parse(req.query);

    const searchContent = await searchContentByType({ type, query, page });

    return res.status(OK).json(searchContent);
  } catch (error) {
    next(error);
  }
};
