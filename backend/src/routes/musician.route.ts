import { Router } from "express";
import { getMusicianIdsHandler } from "../controllers/musician.controller";

const musicianRoute = Router();

// prefix: /musician
musicianRoute.post("/getIds", getMusicianIdsHandler);

export default musicianRoute;
