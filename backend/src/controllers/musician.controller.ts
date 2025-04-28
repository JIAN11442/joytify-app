import { RequestHandler } from "express";

import { getMusicianId } from "../services/musician.service";
import { musicianZodSchema } from "../schemas/musician.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { GetMusicianIdRequest } from "@joytify/shared-types/types";
import { objectIdZodSchema } from "../schemas/util.zod";

const { OK } = HttpCode;

// get musician ID handler
export const getMusicianIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const params: GetMusicianIdRequest = musicianZodSchema.parse(req.body);

    const { id } = await getMusicianId(params);

    return res.status(OK).json(id);
  } catch (error) {
    next(error);
  }
};
