import { Router } from "express";
import {
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistsHandler,
  getTargetPlaylistHandler,
  updatePlaylistHandler,
} from "../controllers/playlist.controller";

const playlistRoute = Router();

// prefix: /playlist
playlistRoute.get("/", getPlaylistsHandler);
playlistRoute.get("/:id", getTargetPlaylistHandler);

playlistRoute.post("/create", createPlaylistHandler);
playlistRoute.patch("/update/:id", updatePlaylistHandler);
playlistRoute.delete("/delete/:id", deletePlaylistHandler);

export default playlistRoute;
