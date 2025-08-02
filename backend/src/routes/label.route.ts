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

labelRoute.post("/", createLabelHandler);
labelRoute.patch("/remove/:labelId", removeLabelHandler);

export default labelRoute;
