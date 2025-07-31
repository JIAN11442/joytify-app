import { Router } from "express";
import {
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistsHandler,
  getTargetPlaylistHandler,
  updatePlaylistHandler,
} from "../controllers/playlist.controller";
import authenticate from "../middlewares/authenticate.middleware";

const playlistRoute = Router();

// prefix: /playlists
playlistRoute.get("/", authenticate, getPlaylistsHandler);
playlistRoute.get("/:id", authenticate, getTargetPlaylistHandler);

playlistRoute.post("/", authenticate, createPlaylistHandler);
playlistRoute.patch("/:id", authenticate, updatePlaylistHandler);
playlistRoute.delete("/:id", authenticate, deletePlaylistHandler);

export default playlistRoute;
