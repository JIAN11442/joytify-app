import { Router } from "express";
import {
  getPopularMusiciansHandler,
  getRecentlyPlayedSongsHandler,
  getRecommendedAlbumsHandler,
  getRecommendedLabelsHandler,
  getRecommendedSongsHandler,
} from "../controllers/homepage.controller";
import authenticate from "../middlewares/authenticate.middleware";

// prefix: /homepage
const homepageRoute = Router();

homepageRoute.get("/musicians/popular/:page", getPopularMusiciansHandler);
homepageRoute.get("/songs/recently/:page", authenticate, getRecentlyPlayedSongsHandler);
homepageRoute.get("/labels/recommendations/:type/:page", getRecommendedLabelsHandler);

homepageRoute.post("/songs/recommendations/:page", getRecommendedSongsHandler);
homepageRoute.post("/albums/recommendations/:page", getRecommendedAlbumsHandler);

export default homepageRoute;
