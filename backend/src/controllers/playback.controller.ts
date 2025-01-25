import { RequestHandler } from "express";

import { createOrUpdatePlaybackLog } from "../services/playback.service";
import { verificationCodeSchema } from "../schemas/auth.schema";
import { playbackLogSchema } from "../schemas/playback.schema";
import { OK } from "../constants/http-code.constant";

export const storePlaybackLogHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const params = playbackLogSchema.parse(req.body);

    const { playbackLog } = await createOrUpdatePlaybackLog({
      userId,
      ...params,
    });

    res.status(OK).json({ playbackLog });
  } catch (error) {
    next(error);
  }
};
