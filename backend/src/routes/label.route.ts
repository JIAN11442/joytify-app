import { Router } from "express";
import {
  createLabelHandler,
  getLabelIdHandler,
  getLabelsHandler,
  removeLabelHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: labels
labelRoute.get("/", getLabelsHandler);
labelRoute.get("/getId", getLabelIdHandler);

labelRoute.post("/create", createLabelHandler);
labelRoute.patch("/remove/:id", removeLabelHandler);

export default labelRoute;
