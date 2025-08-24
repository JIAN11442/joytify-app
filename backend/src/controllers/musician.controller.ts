import { RequestHandler } from "express";

import {
  followTargetMusician,
  getFollowingMusicians,
  getMusicianById,
  getMusicianId,
  getRecommendedMusicians,
  unfollowTargetMusician,
  updateMusicianById,
} from "../services/musician.service";
import { musicianZodSchema, updateMusicianZodSchema } from "../schemas/musician.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { GetMusicianIdRequest } from "@joytify/shared-types/types";

const { OK } = HttpCode;

// get musician ID handler
export const getMusicianIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: GetMusicianIdRequest = musicianZodSchema.parse(req.query);

    const { id } = await getMusicianId({ userId, ...params });

    return res.status(OK).json(id);
  } catch (error) {
    next(error);
  }
};

// get musician by id handler
export const getMusicianByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const musicianId = objectIdZodSchema.parse(req.params.musicianId);

    const { musician } = await getMusicianById(musicianId);

    return res.status(OK).json(musician);
  } catch (error) {
    next(error);
  }
};

// get user following musicians handler
export const getFollowingMusiciansHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const followingMusicians = await getFollowingMusicians(userId);

    return res.status(OK).json(followingMusicians);
  } catch (error) {
    next(error);
  }
};

// get recommended musicians handler
export const getRecommendedMusiciansHandler: RequestHandler = async (req, res, next) => {
  try {
    const musicianId = objectIdZodSchema.parse(req.params.musicianId);
    const recommendedMusicians = await getRecommendedMusicians(musicianId);

    return res.status(OK).json(recommendedMusicians);
  } catch (error) {
    next(error);
  }
};

// update musician handler
export const updateMusicianHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const musicianId = objectIdZodSchema.parse(req.params.musicianId);
    const params = updateMusicianZodSchema.parse(req.body);

    const updatedMusician = await updateMusicianById({ userId, musicianId, ...params });

    return res.status(OK).json(updatedMusician);
  } catch (error) {
    next(error);
  }
};

// follow musician handler
export const followMusicianHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const musicianId = objectIdZodSchema.parse(req.params.musicianId);

    const { musician } = await followTargetMusician({ userId, musicianId });

    return res.status(OK).json(musician);
  } catch (error) {
    next(error);
  }
};

// unfollow musician handler
export const unfollowMusicianHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const musicianId = objectIdZodSchema.parse(req.params.musicianId);

    const { musician } = await unfollowTargetMusician({ userId, musicianId });

    return res.status(OK).json(musician);
  } catch (error) {
    next(error);
  }
};
