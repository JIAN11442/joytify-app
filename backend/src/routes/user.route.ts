import { Router } from "express";
import { getUserHandler } from "../controllers/user.controller";

const userRoute = Router();

// prefix: /user
userRoute.get("/", getUserHandler);

export default userRoute;
