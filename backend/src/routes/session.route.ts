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
sessionRoute.delete("/:id", deleteSessionByIdHandler);
sessionRoute.delete("/sign-out-all", deleteUserSessionsHandler);
sessionRoute.patch("/heartbeat", touchSessionHeartBeatHandler);

export default sessionRoute;
