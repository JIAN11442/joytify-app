import { RequestHandler } from "express";
import { songSchema } from "../schemas/song.schema";
import {
  CONFLICT,
  CREATED,
  INTERNAL_SERVER_ERROR,
} from "../constants/http-code.constant";
import { verificationCodeSchema } from "../schemas/auth.schema";
import SongModel from "../models/song.model";
import appAssert from "../utils/app-assert.util";

export const createSongHandler: RequestHandler = async (req, res, next) => {
  try {
    // get all data
    const userId = verificationCodeSchema.parse(req.userId);
    const songInfo = songSchema.parse(req.body);

    // check if song already exists
    const songIsExist = await SongModel.exists({
      userId: userId,
      title: songInfo.title,
      artist: songInfo.artist,
    });

    appAssert(!songIsExist, CONFLICT, "Song already exists");

    const song = await SongModel.create({ ...songInfo, userId });

    appAssert(song, INTERNAL_SERVER_ERROR, "Failed to create song");

    return res.status(CREATED).json(songInfo);
  } catch (error) {
    next(error);
  }
};
