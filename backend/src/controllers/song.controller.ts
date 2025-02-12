import { RequestHandler } from "express";

import SongModel from "../models/song.model";
import {
  createNewSong,
  deleteSongById,
  getSongById,
  refreshSongPlaybackStats,
} from "../services/song.service";

import { songZodSchema } from "../schemas/song.zod";
import { objectIdZodSchema } from "../schemas/util.zod";
import { CREATED, OK } from "../constants/http-code.constant";
import { getTotalPlaybackDurationAndCount } from "../services/playback.service";

// create new song handler
export const createSongHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songInfo = songZodSchema.parse(req.body);

    const { song } = await createNewSong({ userId, songInfo });

    return res.status(CREATED).json(song);
  } catch (error) {
    next(error);
  }
};

// get all songs handler
export const getAllSongsHandler: RequestHandler = async (req, res, next) => {
  try {
    const songs = await SongModel.find({})
      .populate({ path: "artist", select: "name" })
      .populate({ path: "lyricists", select: "name" })
      .populate({ path: "composers", select: "name" })
      .populate({ path: "languages", select: "label" })
      .populate({ path: "album", select: "title" });

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

// update song's playback stats handler
export const updateSongPlaybackStatsHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const songId = objectIdZodSchema.parse(req.params.id);

    const { updatedSong } = await refreshSongPlaybackStats(songId);

    return res.status(OK).json({ updatedSong });
  } catch (error) {
    next(error);
  }
};

// delete song by id handler
export const deleteSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = objectIdZodSchema.parse(req.userId);
    const songId = objectIdZodSchema.parse(req.params.id);

    await deleteSongById({ userId, songId });

    return res.status(OK).json({ message: "Delete target song successfully" });
  } catch (error) {
    next(error);
  }
};

// get song's playback stats handler
export const getSongPlaybackStatsHandler: RequestHandler = async (
  req,
  res,
  next
) => {
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
