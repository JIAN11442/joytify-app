import { Router } from "express";
import {
  deregisterUserHandler,
  getUserHandler,
  resetPasswordHandler,
} from "../controllers/user.controller";
import authenticate from "../middlewares/authenticate.middleware";

const userRoute = Router();

// prefix: /user
userRoute.get("/", authenticate, getUserHandler);
userRoute.post("/password/reset/:token", resetPasswordHandler);
userRoute.delete("/deregister", authenticate, deregisterUserHandler);

export default userRoute;
