import { Router } from "express";
import {
  changePasswordHandler,
  deregisterUserHandler,
  getAuthenticatedUserInfoHandler,
  getProfileCollectionsInfoHandler,
  getProfileUserInfoHandler,
  resetPasswordHandler,
  updateUserHandler,
} from "../controllers/user.controller";
import authenticate from "../middlewares/authenticate.middleware";

const userRoute = Router();

// prefix: /users
userRoute.get("/authenticated", authenticate, getAuthenticatedUserInfoHandler);
userRoute.get("/profile", authenticate, getProfileUserInfoHandler);
userRoute.get("/profile/:collection", authenticate, getProfileCollectionsInfoHandler);

userRoute.patch("/", authenticate, updateUserHandler);
userRoute.patch("/password/reset/:token", resetPasswordHandler);
userRoute.patch("/password/change", authenticate, changePasswordHandler);

userRoute.delete("/deregister", authenticate, deregisterUserHandler);

export default userRoute;
