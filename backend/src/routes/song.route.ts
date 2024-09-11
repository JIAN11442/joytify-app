import { Router } from "express";
import {
  createSongHandler,
  getSongByIdHandler,
} from "../controllers/song.controller";

const songRoute = Router();

// prefix: /song
songRoute.post("/create", createSongHandler);
songRoute.get("/:id", getSongByIdHandler);

export default songRoute;
