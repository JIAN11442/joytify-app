import { Router } from "express";
import {
  createPlaylistHandler,
  getPlaylistHandler,
  getTargetPlaylistHandler,
} from "../controllers/playlist.controller";

const playlistRoute = Router();

// prefix: /playlist
playlistRoute.get("/", getPlaylistHandler);
playlistRoute.get("/:id", getTargetPlaylistHandler);

playlistRoute.post("/create", createPlaylistHandler);

export default playlistRoute;
