import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
  getAlbumByIdHandler,
  getRecommendedAlbumsHandler,
} from "../controllers/album.controller";
import authenticate from "../middlewares/authenticate.middleware";

const albumRoute = Router();

// prefix: albums
albumRoute.get("/recommendations/:albumId", getRecommendedAlbumsHandler);
albumRoute.get("/", authenticate, getUserAlbumsHandler);
albumRoute.get("/:albumId", authenticate, getAlbumByIdHandler);

albumRoute.post("/", authenticate, createAlbumHandler);

albumRoute.patch("/remove/:albumId", authenticate, removeUserAlbumHandler);

export default albumRoute;
