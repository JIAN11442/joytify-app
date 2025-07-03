import { Router } from "express";
import {
  createAlbumHandler,
  removeUserAlbumHandler,
  getUserAlbumsHandler,
  deleteUserAlbumHandler,
  getAlbumByIdHandler,
} from "../controllers/album.controller";

const albumRoute = Router();

// prefix: album
albumRoute.get("/", getUserAlbumsHandler);
albumRoute.get("/:id", getAlbumByIdHandler);

albumRoute.post("/create", createAlbumHandler);
albumRoute.patch("/remove/:id", removeUserAlbumHandler);
albumRoute.delete("delete/:id", deleteUserAlbumHandler);

export default albumRoute;
