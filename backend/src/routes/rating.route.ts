import { Router } from "express";
import {
  getRatingBySongIdHandler,
  upsertSongRatingHandler,
} from "../controllers/rating.controller";

const ratingRoute = Router();

// prefix: /ratings
ratingRoute.get("/:songId", getRatingBySongIdHandler);
ratingRoute.post("/song", upsertSongRatingHandler);

export default ratingRoute;
