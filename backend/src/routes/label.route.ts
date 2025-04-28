import { Router } from "express";
import {
  createLabelHandler,
  getLabelIdHandler,
  getLabelsHandler,
  removeLabelHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: label
labelRoute.get("/", getLabelsHandler);
labelRoute.post("/create", createLabelHandler);
labelRoute.patch("/remove/:id", removeLabelHandler);
labelRoute.post("/getId", getLabelIdHandler);

export default labelRoute;
