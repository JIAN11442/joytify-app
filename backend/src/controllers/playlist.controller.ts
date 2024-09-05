import { RequestHandler } from "express";

import { verificationCodeSchema } from "../schemas/auth.schema";
import { playlistSchame } from "../schemas/playlist.schema";
import PlaylistModel from "../models/playlist.model";

import {
  createNewPlaylist,
  getUserPlaylist,
  getUserPlaylistById,
  updatePlaylistById,
} from "../services/playlist.service";
import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../constants/http-code.constant";
import appAssert from "../utils/app-assert.util";

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

// update playlist cover image handler
export const updatePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const playlistId = verificationCodeSchema.parse(req.params.id);
    const userId = verificationCodeSchema.parse(req.userId);
    const params = playlistSchame.parse(req.body);

    // update playlist cover image
    const { playlist } = await updatePlaylistById({
      playlistId,
      userId,
      ...params,
    });

    return res.status(OK).json(playlist);
  } catch (error) {
    next(error);
  }
};

// delete playlist handler
export const deletePlaylistHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const playlistId = verificationCodeSchema.parse(req.params.id);

    const deletePlaylist = await PlaylistModel.findOneAndDelete({
      _id: playlistId,
      userId,
    });

    appAssert(
      deletePlaylist,
      INTERNAL_SERVER_ERROR,
      "Failed to delete playlist"
    );

    return res.status(OK).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// remove playlist from user profile handler
export const changePlaylistHiddenStateHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const playlistId = verificationCodeSchema.parse(req.params.id);
    const { hiddenState } = req.body;

    const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
      {
        _id: playlistId,
        userId,
      },
      { hidden: hiddenState }
    );

    appAssert(
      updatedPlaylist,
      INTERNAL_SERVER_ERROR,
      `Failed to change playlist hidden state to ${hiddenState}`
    );

    return res
      .status(OK)
      .json({ message: `Playlist hidden state changed to ${hiddenState}` });
  } catch (error) {
    next(error);
  }
};
