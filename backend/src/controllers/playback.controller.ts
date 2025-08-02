import { RequestHandler } from "express";

import { objectIdZodSchema } from "../schemas/util.zod";
import { playbackZodSchema } from "../schemas/playback.zod";
import { createPlaybackLog } from "../services/playback.service";
import { shouldPromptForRating } from "../services/rating.service";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreatePlaybackLogRequest } from "@joytify/shared-types/types";

const { OK, CREATED } = HttpCode;

// create playback log handler
export const createPlaybackLogHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { songId, ...rest }: CreatePlaybackLogRequest = playbackZodSchema.parse(req.body);

    const { playbackLog } = await createPlaybackLog({ userId, songId, ...rest });
    const { shouldPrompt, song } = await shouldPromptForRating({ userId, songId });

    const statusCode = playbackLog ? CREATED : OK;
    res.status(statusCode).json({ playbackLog, shouldPrompt, song });
  } catch (error) {
    next(error);
  }
};
