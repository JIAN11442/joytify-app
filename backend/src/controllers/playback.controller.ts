import { RequestHandler } from "express";

import { getAllPlaybackLogs, upsertPlaybackLog } from "../services/playback.service";
import { objectIdZodSchema } from "../schemas/util.zod";
import { playbackZodSchema } from "../schemas/playback.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { StorePlaybackLogRequest } from "@joytify/shared-types/types";

const { OK } = HttpCode;

// store playback log handler
export const storePlaybackLogHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: StorePlaybackLogRequest = playbackZodSchema.parse(req.body);

    const { playbackLog } = await upsertPlaybackLog({ userId, ...params });

    res.status(OK).json({ playbackLog });
  } catch (error) {
    next(error);
  }
};

// get playback logs handler(*)
export const getPlaybackLogsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { playbackLogs } = await getAllPlaybackLogs();

    res.status(OK).json({ playbackLogs });
  } catch (error) {
    next(error);
  }
};
