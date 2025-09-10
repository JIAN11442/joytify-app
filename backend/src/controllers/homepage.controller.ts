import { RequestHandler } from "express";
import {
  getPersonalRecommendedItemsZodSchema,
  getPublicRecommendedItemsZodSchema,
} from "../schemas/homepage.zod";
import { objectIdZodSchema, pageZodSchema } from "../schemas/util.zod";
import {
  getPopularMusicians,
  getRecentlyPlayedSongs,
  getRecommendedAlbums,
  getRecommendedLabels,
  getRecommendedSongs,
} from "../services/homepage.service";
import { HttpCode } from "@joytify/types/constants";
import { labelZodSchema } from "../schemas/label.zod";

const { OK } = HttpCode;

export const getPopularMusiciansHandler: RequestHandler = async (req, res, next) => {
  try {
    const page = pageZodSchema.parse(req.params.page);

    const popularMusicians = await getPopularMusicians(page);

    return res.status(OK).json(popularMusicians);
  } catch (error) {
    next(error);
  }
};

export const getRecentlyPlayedSongsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const page = pageZodSchema.parse(req.params.page);

    const recentlyPlayedSongs = await getRecentlyPlayedSongs({ userId, page });

    return res.status(OK).json(recentlyPlayedSongs);
  } catch (error) {
    next(error);
  }
};

export const getRecommendedSongsHandler: RequestHandler = async (req, res, next) => {
  try {
    const page = pageZodSchema.parse(req.params.page);
    const { songIds } = getPersonalRecommendedItemsZodSchema.parse(req.body);

    const recommendedSongs = await getRecommendedSongs({ page, songIds });

    return res.status(OK).json(recommendedSongs);
  } catch (error) {
    next(error);
  }
};

export const getRecommendedAlbumsHandler: RequestHandler = async (req, res, next) => {
  try {
    const page = pageZodSchema.parse(req.body.page);
    const { songIds } = getPersonalRecommendedItemsZodSchema.parse(req.body);

    const recommendedAlbums = await getRecommendedAlbums({ page, songIds });

    return res.status(OK).json(recommendedAlbums);
  } catch (error) {
    next(error);
  }
};

export const getRecommendedLabelsHandler: RequestHandler = async (req, res, next) => {
  try {
    const page = pageZodSchema.parse(req.params.page);
    const type = labelZodSchema.parse(req.params.type);

    const recommendedLabels = await getRecommendedLabels({ type, page });

    return res.status(OK).json(recommendedLabels);
  } catch (error) {
    next(error);
  }
};
