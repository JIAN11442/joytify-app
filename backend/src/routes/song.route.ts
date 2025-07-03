import { Router } from "express";
import {
  createSongHandler,
  deleteSongByIdHandler,
  getAllSongsHandler,
  getSongByIdHandler,
  getSongPlaybackStatsHandler,
  getUserSongsHandler,
  getUserSongsStatsHandler,
  updateSongInfoHandler,
  updateSongPaleteeHandler,
  updateSongPlaybackStatsHandler,
  updateSongPlaylistsAssignmentHandler,
  updateSongRatingHandler,
} from "../controllers/song.controller";
import authenticate from "../middlewares/authenticate.middleware";

const songRoute = Router();

// prefix: /song
songRoute.get("/all", getAllSongsHandler);
songRoute.get("/user", authenticate, getUserSongsHandler);
songRoute.get("/stats", authenticate, getUserSongsStatsHandler);
songRoute.get("/:id", authenticate, getSongByIdHandler);
songRoute.post("/", authenticate, createSongHandler);
songRoute.patch("/:id/info", authenticate, updateSongInfoHandler);
songRoute.patch("/:id/rating", authenticate, updateSongRatingHandler);
songRoute.patch("/:id/playlist-assignment", authenticate, updateSongPlaylistsAssignmentHandler);
songRoute.delete("/:id", authenticate, deleteSongByIdHandler);

songRoute.get("/stats/playback/:id", authenticate, getSongPlaybackStatsHandler); //(*)
songRoute.patch("/update/activities/:id", authenticate, updateSongPlaybackStatsHandler); //(*)
songRoute.patch("/paletee", updateSongPaleteeHandler); // (*)

export default songRoute;
