import { Router } from "express";
import {
  createLabelHandler,
  getLabelsIdHandler,
  getUserLabelsHandler,
  removeLabelHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: label
labelRoute.get("/", getUserLabelsHandler);
labelRoute.post("/create", createLabelHandler);
labelRoute.patch("/remove/:id", removeLabelHandler);

labelRoute.post("/getIds", getLabelsIdHandler); //(*)

export default labelRoute;
