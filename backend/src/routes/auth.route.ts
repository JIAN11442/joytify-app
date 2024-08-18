import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  verifyEmailHandler,
} from "../components/auth.controller";

const authRoute = Router();

// prefix: /auth
authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHandler);
authRoute.post("/password/forgot", forgotPasswordHandler);

authRoute.get("/email/verify/:code", verifyEmailHandler);
authRoute.get("/logout", logoutHandler);

export default authRoute;
