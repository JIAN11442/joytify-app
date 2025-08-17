import { Router } from "express";
import {
  createSongHandler,
  deleteSongByIdHandler,
  getAllSongsHandler,
  getRecommendedSongsHandler,
  getSongByIdHandler,
  getSongsByQueryHandler,
  getUserSongsHandler,
  getUserSongsStatsHandler,
  updateSongInfoHandler,
  updateSongPlaylistsAssignmentHandler,
} from "../controllers/song.controller";
import authenticate from "../middlewares/authenticate.middleware";

const songRoute = Router();

// prefix: /songs
songRoute.get("/all", getAllSongsHandler);
songRoute.get("/stats", authenticate, getUserSongsStatsHandler);
songRoute.get("/recommendations/:playlistId", getRecommendedSongsHandler);
songRoute.get("/search/", getSongsByQueryHandler);
songRoute.get("/", authenticate, getUserSongsHandler);
songRoute.get("/:songId", authenticate, getSongByIdHandler);

songRoute.post("/", authenticate, createSongHandler);

songRoute.patch("/:songId/info", authenticate, updateSongInfoHandler);
songRoute.patch("/:songId/playlist-assignment", authenticate, updateSongPlaylistsAssignmentHandler);

songRoute.delete("/:songId", authenticate, deleteSongByIdHandler);

export default songRoute;
