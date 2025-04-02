import { Router } from "express";
import {
  createSongHandler,
  deleteSongByIdHandler,
  getAllSongsHandler,
  getSongByIdHandler,
  getSongPlaybackStatsHandler,
  updateSongPlaybackStatsHandler,
} from "../controllers/song.controller";
import authenticate from "../middlewares/authenticate.middleware";

const songRoute = Router();

// prefix: /song
songRoute.get("/", getAllSongsHandler);
songRoute.get("/:id", authenticate, getSongByIdHandler);
songRoute.get("/stats/:id", authenticate, getSongPlaybackStatsHandler); //(*)
songRoute.post("/create", authenticate, createSongHandler);
songRoute.patch("/update/activity/:id", authenticate, updateSongPlaybackStatsHandler); //(*)
songRoute.delete("/delete/:id", deleteSongByIdHandler); //(*)

export default songRoute;
