import { Router } from "express";
import {
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistsHandler,
  getTargetPlaylistHandler,
  updatePlaylistHandler,
  updatePlaylistStatsHandler,
  removePlaylistStatsHandler,
} from "../controllers/playlist.controller";
import authenticate from "../middlewares/authenticate.middleware";

const playlistRoute = Router();

// prefix: /playlist
playlistRoute.get("/", authenticate, getPlaylistsHandler);
playlistRoute.get("/:id", authenticate, getTargetPlaylistHandler);
playlistRoute.post("/create", authenticate, createPlaylistHandler);
playlistRoute.patch("/update/:id", authenticate, updatePlaylistHandler);
playlistRoute.delete("/delete/:id", authenticate, deletePlaylistHandler);

// temporary routes (*)
playlistRoute.patch("/update-stats", updatePlaylistStatsHandler);
playlistRoute.delete("/remove-stats", removePlaylistStatsHandler);

export default playlistRoute;
