import { Router } from "express";
import {
  createLabelHandler,
  deleteLabelHandler,
  getLabelIdsHandler,
  getUserLabelsHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: label
labelRoute.get("/", getUserLabelsHandler);
labelRoute.post("/create", createLabelHandler);
labelRoute.post("/getIds", getLabelIdsHandler);
labelRoute.delete("/delete/:id", deleteLabelHandler);

export default labelRoute;
