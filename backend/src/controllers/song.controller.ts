import { RequestHandler } from "express";

import {
  createNewSong,
  deleteSongById,
  getSongById,
  getSongs,
  refreshSongPlaybackStats,
} from "../services/song.service";
import { getTotalPlaybackDurationAndCount } from "../services/playback.service";

import { songZodSchema } from "../schemas/song.zod";
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
    const { songs } = await getSongs();

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

// delete song by id handler(*)
export const deleteSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    // const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);

    await deleteSongById({ songId });

    return res.status(OK).json({ message: "Delete target song successfully" });
  } catch (error) {
    next(error);
  }
};

// update song's playback stats handler(*)
export const updateSongPlaybackStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const songId = objectIdZodSchema.parse(req.params.id);

    const { updatedSong } = await refreshSongPlaybackStats(songId);

    return res.status(OK).json({ updatedSong });
  } catch (error) {
    next(error);
  }
};

// get song's playback stats handler(*)
export const getSongPlaybackStatsHandler: RequestHandler = async (req, res, next) => {
  try {
    const songId = objectIdZodSchema.parse(req.params.id);
    const { totalCount, totalDuration, weightedAvgDuration } =
      await getTotalPlaybackDurationAndCount(songId);

    const averageDuration = parseFloat((totalDuration / totalCount).toFixed(2));

    return res.status(OK).json({
      totalCount,
      totalDuration,
      averageDuration,
      weightedAvgDuration,
    });
  } catch (error) {
    next(error);
  }
};
