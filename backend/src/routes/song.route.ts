import { Router } from "express";
import {
  createSongHandler,
  deleteSongByIdHandler,
  getAllSongsHandler,
  getSongByIdHandler,
  getUserSongsHandler,
  getUserSongsStatsHandler,
  updateSongInfoHandler,
  updateSongPlaylistsAssignmentHandler,
  updateSongRatingHandler,
} from "../controllers/song.controller";
import authenticate from "../middlewares/authenticate.middleware";

const songRoute = Router();

// prefix: /songs
songRoute.get("/all", getAllSongsHandler);
songRoute.get("/stats", authenticate, getUserSongsStatsHandler);
songRoute.get("/", authenticate, getUserSongsHandler);
songRoute.get("/:id", authenticate, getSongByIdHandler);

songRoute.post("/", authenticate, createSongHandler);

songRoute.patch("/:id/info", authenticate, updateSongInfoHandler);
songRoute.patch("/:id/rating", authenticate, updateSongRatingHandler);
songRoute.patch("/:id/playlist-assignment", authenticate, updateSongPlaylistsAssignmentHandler);

songRoute.delete("/:id", authenticate, deleteSongByIdHandler);

export default songRoute;
