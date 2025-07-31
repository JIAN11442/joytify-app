import { Router } from "express";
import { createPlaybackLogHandler } from "../controllers/playback.controller";

const playbackRoute = Router();

// prefix: /playback
playbackRoute.post("/", createPlaybackLogHandler);

export default playbackRoute;
