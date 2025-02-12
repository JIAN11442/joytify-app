import { RequestHandler } from "express";

import {
  createOrUpdatePlaybackLog,
  getAllPlaybackLogs,
} from "../services/playback.service";
import { objectIdZodSchema } from "../schemas/util.zod";
import { playbackZodSchema } from "../schemas/playback.zod";
import { OK } from "../constants/http-code.constant";

// store playback log handler
export const storePlaybackLogHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params = playbackZodSchema.parse(req.body);

    const { playbackLog } = await createOrUpdatePlaybackLog({
      userId,
      ...params,
    });

    res.status(OK).json({ playbackLog });
  } catch (error) {
    next(error);
  }
};

// get playback logs handler
export const getPlaybackLogsHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { playbackLogs } = await getAllPlaybackLogs();

    res.status(OK).json({ playbackLogs });
  } catch (error) {
    next(error);
  }
};
