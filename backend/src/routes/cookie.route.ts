import { Router } from "express";
import {
  getUserPreferencesCookiePayloadHandler,
  updateUserPreferencesCookiePayloadHandler,
} from "../controllers/cookie.controller";
import authenticate from "../middlewares/authenticate.middleware";

const cookieRoute = Router();

// prefix: /cookie
cookieRoute.get("/get-user-preferences", getUserPreferencesCookiePayloadHandler);
cookieRoute.post(
  "/update-user-preferences",
  authenticate,
  updateUserPreferencesCookiePayloadHandler
);

export default cookieRoute;
