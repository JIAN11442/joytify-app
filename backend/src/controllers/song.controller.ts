import { RequestHandler } from "express";

import {
  createNewSong,
  deleteSongById,
  getAllSongs,
  getSongById,
  getUserSongs,
  rateTargetSong,
  statsUserSongs,
  assignSongToPlaylists,
  updateSongInfoById,
} from "../services/song.service";

import {
  deleteSongZodSchema,
  songZodSchema,
  updateSongInfoZodSchema,
  updateSongPlaylistsZodSchema,
  updateSongRateZodSchema,
} from "../schemas/song.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { HttpCode } from "@joytify/shared-types/constants";
import { CreateSongRequest } from "@joytify/shared-types/types";

const { CREATED, OK } = HttpCode;

// create new song handler
export const createSongHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songInfo: CreateSongRequest = songZodSchema.parse(req.body);

    const { song } = await createNewSong({ userId, songInfo });

    return res.status(CREATED).json(song);
  } catch (error) {
    next(error);
  }
};

// get all songs handler
export const getAllSongsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { songs } = await getAllSongs();

    return res.status(OK).json(songs);
  } catch (error) {
    next(error);
  }
};

// get song by id handler
export const getSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = objectIdZodSchema.parse(req.params.id);

    const { song } = await getSongById(id);

    return res.status(OK).json(song);
  } catch (error) {
    next(error);
  }
};

// get user's songs handler
export const getUserSongsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const { songs } = await getUserSongs(userId);

    return res.status(OK).json(songs);
  } catch (error) {
    next(error);
  }
};

// get user's songs stats handler
export const getUserSongsStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songStats = await statsUserSongs(userId);

    return res.status(OK).json(songStats);
  } catch (error) {
    next(error);
  }
};

// update target song's info handler
export const updateSongInfoHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);
    const request = updateSongInfoZodSchema.parse(req.body);

    const { updatedSong } = await updateSongInfoById({ userId, songId, ...request });

    return res.status(OK).json(updatedSong);
  } catch (error) {
    next(error);
  }
};

// update target song's rating state handler
export const updateSongRatingHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);
    const request = updateSongRateZodSchema.parse(req.body);

    const { updatedSong } = await rateTargetSong({ userId, songId, ...request });

    return res.status(OK).json(updatedSong);
  } catch (error) {
    next(error);
  }
};

// update song's playlists handler
export const updateSongPlaylistsAssignmentHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);
    const params = updateSongPlaylistsZodSchema.parse(req.body);

    const { updatedSong } = await assignSongToPlaylists({ userId, songId, ...params });

    return res.status(OK).json(updatedSong);
  } catch (error) {
    next(error);
  }
};

// delete song by id handler
export const deleteSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);
    const { shouldDeleteSongs } = deleteSongZodSchema.parse(req.body);

    const deletedSong = await deleteSongById({ userId, songId, shouldDeleteSongs });

    return res.status(OK).json(deletedSong);
  } catch (error) {
    next(error);
  }
};
