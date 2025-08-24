import { Router } from "express";
import {
  followMusicianHandler,
  getFollowingMusiciansHandler,
  getMusicianByIdHandler,
  getMusicianIdHandler,
  getRecommendedMusiciansHandler,
  unfollowMusicianHandler,
  updateMusicianHandler,
} from "../controllers/musician.controller";
import authenticate from "../middlewares/authenticate.middleware";

const musicianRoute = Router();

// prefix: /musicians
musicianRoute.get("/getId", authenticate, getMusicianIdHandler);
musicianRoute.get("/following", authenticate, getFollowingMusiciansHandler);
musicianRoute.get("/recommendations/:musicianId", getRecommendedMusiciansHandler);
musicianRoute.get("/:musicianId", authenticate, getMusicianByIdHandler);

musicianRoute.patch("/follow/:musicianId", authenticate, followMusicianHandler);
musicianRoute.patch("/unfollow/:musicianId", authenticate, unfollowMusicianHandler);
musicianRoute.patch("/:musicianId", authenticate, updateMusicianHandler);

export default musicianRoute;
