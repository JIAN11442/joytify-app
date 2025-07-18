import { RequestHandler } from "express";

import { objectIdZodSchema } from "../schemas/util.zod";
import { playbackZodSchema } from "../schemas/playback.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { StorePlaybackLogRequest } from "@joytify/shared-types/types";
import { createPlaybackLog } from "../services/playback.service";

const { OK } = HttpCode;

// store playback log handler
export const storePlaybackLogHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: StorePlaybackLogRequest = playbackZodSchema.parse(req.body);

    const { playbackLog } = await createPlaybackLog({ userId, ...params });

    res.status(OK).json({ playbackLog });
  } catch (error) {
    next(error);
  }
};
