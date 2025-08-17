import { Router } from "express";
import {
  createLabelHandler,
  getLabelByIdHandler,
  getLabelIdHandler,
  getLabelsHandler,
  getRecommendedLabelsHandler,
  removeLabelHandler,
} from "../controllers/label.controller";
import authenticate from "../middlewares/authenticate.middleware";

const labelRoute = Router();

// prefix: labels
labelRoute.get("/getId", authenticate, getLabelIdHandler);
labelRoute.get("/recommendations/:labelId", getRecommendedLabelsHandler);
labelRoute.get("/:labelId", authenticate, getLabelByIdHandler);
labelRoute.get("/", authenticate, getLabelsHandler);

labelRoute.post("/", authenticate, createLabelHandler);
labelRoute.patch("/remove/:labelId", authenticate, removeLabelHandler);

export default labelRoute;
