import { Router } from "express";
import {
  deregisterUserHandler,
  getUserHandler,
} from "../controllers/user.controller";

const userRoute = Router();

// prefix: /user
userRoute.get("/", getUserHandler);
userRoute.delete("/deregister", deregisterUserHandler);

export default userRoute;
