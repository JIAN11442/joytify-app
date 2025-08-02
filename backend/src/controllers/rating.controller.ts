import { RequestHandler } from "express";
import { objectIdZodSchema } from "../schemas/util.zod";
import { upsertSongRatingZodSchema } from "../schemas/rating.zod";
import { getRatingBySongId, upsertSongRating } from "../services/rating.service";
import { HttpCode, RatingTypeOptions } from "@joytify/shared-types/constants";

const { OK } = HttpCode;
const { SONG } = RatingTypeOptions;

export const getRatingBySongIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.songId);

    const rating = await getRatingBySongId({ userId, songId });

    return res.status(OK).json(rating);
  } catch (error) {
    next(error);
  }
};

export const upsertSongRatingHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params = upsertSongRatingZodSchema.parse(req.body);

    const { updatedSong } = await upsertSongRating({ type: SONG, userId, ...params });

    return res.status(OK).json(updatedSong);
  } catch (error) {
    next(error);
  }
};
