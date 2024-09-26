import { Router } from "express";
import {
  createLabelHandler,
  deleteLabelHandler,
  getUserLabelsHandler,
} from "../controllers/label.controller";

const labelRoute = Router();

// prefix: label
labelRoute.get("/", getUserLabelsHandler);
labelRoute.post("/create", createLabelHandler);
labelRoute.delete("/delete/:id", deleteLabelHandler);

export default labelRoute;
