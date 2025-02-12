import { RequestHandler } from "express";
import {
  createAlbum,
  getUserAlbums,
  removeAlbum,
} from "../services/album.service";
import { OK } from "../constants/http-code.constant";
import { albumZodSchema } from "../schemas/album.zod";
import { objectIdZodSchema } from "../schemas/util.zod";

// get user albums handler
export const getUserAlbumsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);

    const { albums } = await getUserAlbums(userId);

    return res.status(OK).json(albums);
  } catch (error) {
    next(error);
  }
};

// create album handler
export const createAlbumHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params = albumZodSchema.parse(req.body);

    const { album } = await createAlbum({ ...params, userId });

    return res.status(OK).json(album);
  } catch (error) {
    next(error);
  }
};

// remove user album handler
export const removeUserAlbumHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const albumId = objectIdZodSchema.parse(req.params.id);

    const { updatedAlbum } = await removeAlbum({ userId, albumId });

    return res.status(OK).json(updatedAlbum);
  } catch (error) {
    next(error);
  }
};
