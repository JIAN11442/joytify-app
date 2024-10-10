import { Router } from "express";
import {
  createSongHandler,
  deleteSongByIdHandler,
  getSongByIdHandler,
} from "../controllers/song.controller";

const songRoute = Router();

// prefix: /song
songRoute.get("/:id", getSongByIdHandler);
songRoute.post("/create", createSongHandler);
songRoute.delete("/delete/:id", deleteSongByIdHandler);

export default songRoute;
