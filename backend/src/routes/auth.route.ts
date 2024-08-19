import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshTokensHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../components/auth.controller";

const authRoute = Router();

// prefix: /auth
authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHandler);
authRoute.post("/password/forgot", forgotPasswordHandler);
authRoute.post("/password/reset", resetPasswordHandler);

authRoute.get("/email/verify/:code", verifyEmailHandler);
authRoute.get("/logout", logoutHandler);
authRoute.get("/refresh", refreshTokensHandler);

export default authRoute;
