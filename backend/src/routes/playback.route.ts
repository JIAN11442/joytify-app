import { Router } from "express";
import { storePlaybackLogHandler } from "../controllers/playback.controller";

const playbackRoute = Router();

playbackRoute.post("/record", storePlaybackLogHandler);

export default playbackRoute;
