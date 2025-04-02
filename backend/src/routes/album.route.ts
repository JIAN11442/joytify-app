import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
  deleteUserAlbumHandler,
} from "../controllers/album.controller";

const albumRoute = Router();

// prefix: album
albumRoute.get("/", getUserAlbumsHandler);
albumRoute.post("/create", createAlbumHandler);
albumRoute.patch("/remove/:id", removeUserAlbumHandler);
albumRoute.delete("delete/:id", deleteUserAlbumHandler);

export default albumRoute;
