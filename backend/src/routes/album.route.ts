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
albumRoute.get("/:id", getAlbumByIdHandler);
albumRoute.post("/create", createAlbumHandler);
albumRoute.patch("/remove/:id", removeUserAlbumHandler);

export default albumRoute;
