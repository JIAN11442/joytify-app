import { Router } from "express";
import {
  followMusicianHandler,
  getFollowingMusiciansHandler,
  getMusicianByIdHandler,
  getMusicianIdHandler,
  unfollowMusicianHandler,
} from "../controllers/musician.controller";

const musicianRoute = Router();

// prefix: /musician
musicianRoute.get("/following", getFollowingMusiciansHandler);
musicianRoute.get("/:id", getMusicianByIdHandler);

musicianRoute.post("/getId", getMusicianIdHandler);
musicianRoute.patch("/follow/:id", followMusicianHandler);
musicianRoute.patch("/unfollow/:id", unfollowMusicianHandler);

export default musicianRoute;
