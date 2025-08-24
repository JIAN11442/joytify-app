import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
  getAlbumByIdHandler,
  getRecommendedAlbumsHandler,
  updateAlbumHandler,
} from "../controllers/album.controller";
import authenticate from "../middlewares/authenticate.middleware";

const albumRoute = Router();

// prefix: albums
albumRoute.get("/recommendations/:albumId", getRecommendedAlbumsHandler);
albumRoute.get("/", authenticate, getUserAlbumsHandler);
albumRoute.get("/:albumId", authenticate, getAlbumByIdHandler);

albumRoute.post("/", authenticate, createAlbumHandler);

albumRoute.patch("/remove/:albumId", authenticate, removeUserAlbumHandler);
albumRoute.patch("/:albumId", authenticate, updateAlbumHandler);

export default albumRoute;
