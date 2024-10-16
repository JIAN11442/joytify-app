import { Router } from "express";
import {
  changePlaylistHiddenStateHandler,
  createPlaylistHandler,
  deletePlaylistHandler,
  getPlaylistsHandler,
  getTargetPlaylistHandler,
  updatePlaylistHandler,
} from "../controllers/playlist.controller";

const playlistRoute = Router();

// prefix: /playlist
playlistRoute.get("/search/:query", getPlaylistsHandler);
playlistRoute.get("/:id", getTargetPlaylistHandler);

playlistRoute.post("/create", createPlaylistHandler);

playlistRoute.patch("/update/:id", updatePlaylistHandler);
playlistRoute.patch(
  "/change-hidden-state/:id",
  changePlaylistHiddenStateHandler
);

playlistRoute.delete("/delete/:id", deletePlaylistHandler);

export default playlistRoute;
