import { Router } from "express";
import { getSearchContentByTypeHandler } from "../controllers/search.controller";

const searchRoute = Router();

// prefix: /searches
searchRoute.get("/:type", getSearchContentByTypeHandler);

export default searchRoute;
