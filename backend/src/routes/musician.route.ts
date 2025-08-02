import { Router } from "express";
import {
  followMusicianHandler,
  getFollowingMusiciansHandler,
  getMusicianByIdHandler,
  getMusicianIdHandler,
  unfollowMusicianHandler,
} from "../controllers/musician.controller";

const musicianRoute = Router();

// prefix: /musicians
musicianRoute.get("/following", getFollowingMusiciansHandler);
musicianRoute.get("/getId", getMusicianIdHandler);
musicianRoute.get("/:musicianId", getMusicianByIdHandler);

musicianRoute.patch("/follow/:musicianId", followMusicianHandler);
musicianRoute.patch("/unfollow/:musicianId", unfollowMusicianHandler);

export default musicianRoute;
