import { Router } from "express";
import { createSongHandler } from "../controllers/song.controller";

const songRoute = Router();

// prefix: /song
songRoute.post("/create", createSongHandler);

export default songRoute;
