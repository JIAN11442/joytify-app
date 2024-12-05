import { RequestHandler } from "express";
import { songSchema } from "../schemas/song.schema";
import { verificationCodeSchema } from "../schemas/auth.schema";
import {
  createNewSong,
  deleteSongById,
  getSongById,
} from "../services/song.service";
import { CREATED, OK } from "../constants/http-code.constant";

// create new song handler
export const createSongHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const songInfo = songSchema.parse(req.body);

    const { song } = await createNewSong({ userId, songInfo });

    return res.status(CREATED).json(song);
  } catch (error) {
    next(error);
  }
};

// get song by id handler
export const getSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = verificationCodeSchema.parse(req.params.id);

    const { song } = await getSongById(id);

    return res.status(OK).json(song);
  } catch (error) {
    next(error);
  }
};

// delete song by id handler
export const deleteSongByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = verificationCodeSchema.parse(req.userId);
    const songId = verificationCodeSchema.parse(req.params.id);

    await deleteSongById({ userId, songId });

    return res.status(OK).json({ message: "Delete target song successfully" });
  } catch (error) {
    next(error);
  }
};
