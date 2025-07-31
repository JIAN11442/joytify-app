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
musicianRoute.get("/:id", getMusicianByIdHandler);

musicianRoute.patch("/follow/:id", followMusicianHandler);
musicianRoute.patch("/unfollow/:id", unfollowMusicianHandler);

export default musicianRoute;
