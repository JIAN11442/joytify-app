import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
  getAlbumByIdHandler,
} from "../controllers/album.controller";

const albumRoute = Router();

// prefix: albums
albumRoute.get("/", getUserAlbumsHandler);
albumRoute.get("/:albumId", getAlbumByIdHandler);
albumRoute.post("/", createAlbumHandler);
albumRoute.patch("/remove/:albumId", removeUserAlbumHandler);

export default albumRoute;
