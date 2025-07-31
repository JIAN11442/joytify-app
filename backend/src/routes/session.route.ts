import { Router } from "express";
import {
  deleteSessionByIdHandler,
  deleteUserSessionsHandler,
  getUserSessionsHandler,
  touchSessionHeartBeatHandler,
} from "../controllers/session.controller";

const sessionRoute = Router();

// prefix: /session
sessionRoute.get("/", getUserSessionsHandler);
sessionRoute.patch("/heartbeat", touchSessionHeartBeatHandler);
sessionRoute.delete("/", deleteUserSessionsHandler);
sessionRoute.delete("/:id", deleteSessionByIdHandler);

export default sessionRoute;
