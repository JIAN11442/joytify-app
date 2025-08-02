import { RequestHandler } from "express";
import { createAlbum, getAlbumById, getUserAlbums, removeAlbum } from "../services/album.service";
import { albumZodSchema } from "../schemas/album.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateAlbumRequest } from "@joytify/shared-types/types";

const { OK, CREATED } = HttpCode;

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

// get album by id handler
export const getAlbumByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const albumId = objectIdZodSchema.parse(req.params.albumId);

    const { album } = await getAlbumById(albumId);

    return res.status(OK).json(album);
  } catch (error) {
    next(error);
  }
};

// create album handler
export const createAlbumHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params: CreateAlbumRequest = albumZodSchema.parse(req.body);

    const { album } = await createAlbum({ userId, ...params });

    return res.status(CREATED).json(album);
  } catch (error) {
    next(error);
  }
};

// remove user album handler
export const removeUserAlbumHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const albumId = objectIdZodSchema.parse(req.params.albumId);

    const { updatedAlbum } = await removeAlbum({ userId, albumId });

    return res.status(OK).json(updatedAlbum);
  } catch (error) {
    next(error);
  }
};
