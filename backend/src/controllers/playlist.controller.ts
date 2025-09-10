import { RequestHandler } from "express";

import {
  createNewPlaylist,
  deletePlaylistById,
  getUserPlaylists,
  getUserPlaylistById,
  updatePlaylistById,
} from "../services/playlist.service";
import { createPlaylistZodSchema, playlistZodSchema } from "../schemas/playlist.zod";
import { objectIdZodSchema, stringZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/types/constants";

const { OK, CREATED } = HttpCode;

// get user all playlist handler
export const getPlaylistsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const query = stringZodSchema.optional().parse(req.query.search) ?? "";

    const { playlists } = await getUserPlaylists(userId, query);

    return res.status(OK).json(playlists);
  } catch (error) {
    next(error);
  }
};

// get target playlist handler
export const getTargetPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const playlistId = objectIdZodSchema.parse(req.params.playlistId);

    const { playlist } = await getUserPlaylistById(playlistId, userId);

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};

// create playlist handler
export const createPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const params = createPlaylistZodSchema.parse(req.body);

    const { playlist } = await createNewPlaylist({ userId, ...params });

    res.status(CREATED).json(playlist);
  } catch (error) {
    next(error);
  }
};

// update playlist cover image handler
export const updatePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const playlistId = objectIdZodSchema.parse(req.params.playlistId);
    const userId = objectIdZodSchema.parse(req.userId);
    const params = playlistZodSchema.parse(req.body);

    const { playlist } = await updatePlaylistById({ playlistId, userId, ...params });

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};

// delete playlist handler
export const deletePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const currentPlaylistId = objectIdZodSchema.parse(req.params.playlistId);
    const { targetPlaylistId } = req.body;

    const deletedPlaylist = await deletePlaylistById({
      userId,
      currentPlaylistId,
      targetPlaylistId,
    });

    return res.status(OK).json(deletedPlaylist);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
