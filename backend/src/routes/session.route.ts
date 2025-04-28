import { Router } from "express";
import { deleteUserSessionsHandler } from "../controllers/session.controller";

const sessionRoute = Router();

// prefix: /session
sessionRoute.delete("/sign-out-all", deleteUserSessionsHandler);

export default sessionRoute;
