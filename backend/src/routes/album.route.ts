import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
} from "../controllers/album.controller";

const albumRoute = Router();

// prefix: album
albumRoute.get("/", getUserAlbumsHandler);
albumRoute.post("/create", createAlbumHandler);
albumRoute.delete("/delete/:id", removeUserAlbumHandler);

export default albumRoute;
