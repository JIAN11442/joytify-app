import { Router } from "express";
import {
  createLabelHandler,
  getLabelByIdHandler,
  getLabelIdHandler,
  getLabelsHandler,
  removeLabelHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: labels
labelRoute.get("/getId", getLabelIdHandler);
labelRoute.get("/:labelId", getLabelByIdHandler);
labelRoute.get("/", getLabelsHandler);

labelRoute.post("/", createLabelHandler);
labelRoute.patch("/remove/:labelId", removeLabelHandler);

export default labelRoute;
