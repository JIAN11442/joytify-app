import { RequestHandler } from "express";
import { songSchema } from "../schemas/song.schema";
import { verificationCodeSchema } from "../schemas/auth.schema";
import { CREATED } from "../constants/http-code.constant";
import { createNewSong } from "../services/song.service";

export const createSongHandler: RequestHandler = async (req, res, next) => {
  try {
    // get all data
    const userId = verificationCodeSchema.parse(req.userId);
    const songInfo = songSchema.parse(req.body);

    // create new song
    const { song } = await createNewSong({ userId, songInfo });

    return res.status(CREATED).json(song);
  } catch (error) {
    next(error);
  }
};
