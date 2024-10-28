import { RequestHandler } from "express";

import { verificationCodeSchema } from "../schemas/auth.schema";
import { playlistSchema } from "../schemas/playlist.schema";
import PlaylistModel from "../models/playlist.model";

import {
  createNewPlaylist,
  deletePlaylistById,
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
import parseParams from "../utils/parse-params.util";
import SongModel from "../models/song.model";

// get user all playlist handler
export const getPlaylistsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const searchParams = parseParams(req.params.query);

    const { playlists } = await getUserPlaylist(userId, searchParams);

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
    const params = playlistSchema.parse(req.body);

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
    const currentPlaylistId = verificationCodeSchema.parse(req.params.id);
    const { targetPlaylistId } = req.body;

    await deletePlaylistById({
      userId,
      currentPlaylistId,
      targetPlaylistId,
    });

    return res.status(OK).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.log(error);
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
      { _id: playlistId, userId },
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

// add target song ID to playlist handler
export const addSongToPlaylistHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { playlistId, songId } = req.body;
    const validatedPlaylistId = verificationCodeSchema.parse(playlistId);
    const validatedSongId = verificationCodeSchema.parse(songId);

    const updatedPlaylist = await PlaylistModel.findByIdAndUpdate(
      validatedPlaylistId,
      {
        $addToSet: { songs: validatedSongId },
      }
    );

    appAssert(
      updatedPlaylist,
      INTERNAL_SERVER_ERROR,
      "Failed to update playlist"
    );

    const updatedSong = await SongModel.findByIdAndUpdate(validatedSongId, {
      $addToSet: { playlist_for: validatedPlaylistId },
    });

    appAssert(updatedSong, INTERNAL_SERVER_ERROR, "Failed to update song");

    return res.status(OK).json({ updatedPlaylist, updatedSong });
  } catch (error) {
    next(error);
  }
};
