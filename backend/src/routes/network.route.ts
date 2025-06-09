import { Router } from "express";
import {
  getIPAddressFromCloudflare,
  getIPAddressFromHeaders,
  getIPAddressLocation,
} from "../controllers/network.controller";

const networkRoute = Router();

// prefix: /network
networkRoute.get("/ip/headers", getIPAddressFromHeaders);
networkRoute.get("/ip/cloudflare", getIPAddressFromCloudflare);
networkRoute.get("/ip/:ip/geo", getIPAddressLocation);

export default networkRoute;
