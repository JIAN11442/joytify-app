import { Router } from "express";
import {
  deregisterUserHandler,
  getAuthenticatedUserInfoHandler,
  getProfileCollectionsInfoHandler,
  getProfileUserInfoHandler,
  resetPasswordHandler,
  updateUserHandler,
} from "../controllers/user.controller";
import authenticate from "../middlewares/authenticate.middleware";

const userRoute = Router();

// prefix: /user
userRoute.get("/authenticated", authenticate, getAuthenticatedUserInfoHandler);
userRoute.get("/profile", authenticate, getProfileUserInfoHandler);
userRoute.get("/profile/:collection", authenticate, getProfileCollectionsInfoHandler);

userRoute.post("/password/reset/:token", resetPasswordHandler);
userRoute.patch("/update", authenticate, updateUserHandler);
userRoute.delete("/deregister", authenticate, deregisterUserHandler);

export default userRoute;
