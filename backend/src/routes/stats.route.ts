import { Router } from "express";
import { getMonthlyStatsHandler } from "../controllers/stats.controller";

const statsRoute = Router();

// prefix: stats
statsRoute.get("/monthly/:userId/:yearMonth", getMonthlyStatsHandler);

export default statsRoute;
