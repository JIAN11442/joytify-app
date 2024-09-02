import { RequestHandler } from "express";
import { verificationCodeSchema } from "../schemas/auth.schema";
import { CREATED, OK } from "../constants/http-code.constant";
import {
  createNewPlaylist,
  getUserPlaylist,
  getUserPlaylistById,
} from "../services/playlist.service";

// get user all playlist handler
export const getPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);

    const { playlists } = await getUserPlaylist(userId);

    return res.status(OK).json(playlists);
  } catch (error) {
    next(error);
  }
};

// create playlist handler
export const createPlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);

    // create playlist
    const { playlist } = await createNewPlaylist(userId);

    res.status(CREATED).json(playlist);
  } catch (error) {
    next(error);
  }
};

// get target playlist handler
export const getTargetPlaylistHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const playlistId = verificationCodeSchema.parse(req.params.id);
    const userId = verificationCodeSchema.parse(req.userId);

    // get target playlist
    const { playlist } = await getUserPlaylistById(playlistId, userId);

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};
