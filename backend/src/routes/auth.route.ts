import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  verifyEmailHandler,
} from "../components/auth.controller";

const authRoute = Router();

// prefix: /auth
authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHandler);

authRoute.get("/email/verify/:code", verifyEmailHandler);

export default authRoute;
