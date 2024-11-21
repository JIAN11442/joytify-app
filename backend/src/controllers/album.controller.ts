import { RequestHandler } from "express";
import { verificationCodeSchema } from "../schemas/auth.schema";
import {
  createAlbum,
  getUserAlbums,
  removeAlbum,
} from "../services/album.service";
import { OK } from "../constants/http-code.constant";
import { albumSchema } from "../schemas/album.schema";

// get user albums handler
export const getUserAlbumsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);

    const { albums } = await getUserAlbums(userId);

    return res.status(OK).json(albums);
  } catch (error) {
    next(error);
  }
};

// create album handler
export const createAlbumHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const params = albumSchema.parse(req.body);

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
    const userId = verificationCodeSchema.parse(req.userId);
    const albumId = verificationCodeSchema.parse(req.params.id);

    const { updatedAlbum } = await removeAlbum({ userId, albumId });

    return res.status(OK).json({
      message: "User has been successfully removed from album",
      updatedAlbum,
    });
  } catch (error) {
    next(error);
  }
};
