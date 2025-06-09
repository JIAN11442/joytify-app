import { Router } from "express";
import {
  deleteUserSessionsHandler,
  touchSessionHeartBeatHandler,
} from "../controllers/session.controller";

const sessionRoute = Router();

// prefix: /session
sessionRoute.delete("/sign-out-all", deleteUserSessionsHandler);
sessionRoute.patch("/heartbeat", touchSessionHeartBeatHandler);

export default sessionRoute;
