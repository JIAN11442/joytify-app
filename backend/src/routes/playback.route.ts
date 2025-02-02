import { Router } from "express";
import {
  getPlaybackLogsHandler,
  storePlaybackLogHandler,
} from "../controllers/playback.controller";

const playbackRoute = Router();

playbackRoute.post("/record", storePlaybackLogHandler);
playbackRoute.get("/logs", getPlaybackLogsHandler);

export default playbackRoute;
