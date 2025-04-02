import { Router } from "express";
import { getMusicianIdHandler } from "../controllers/musician.controller";

const musicianRoute = Router();

// prefix: /musician
musicianRoute.post("/getId", getMusicianIdHandler);

export default musicianRoute;
