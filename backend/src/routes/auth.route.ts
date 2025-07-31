import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshTokensHandler,
  registerHandler,
  loginWithThirdPartyHandler,
  registerWithThirdPartyHandler,
} from "../controllers/auth.controller";

const authRoute = Router();

// prefix: /auth
authRoute.post("/register", registerHandler);
authRoute.post("/login", loginHandler);
authRoute.post("/third-party/login", loginWithThirdPartyHandler);
authRoute.post("/third-party/register", registerWithThirdPartyHandler);

authRoute.post("/logout", logoutHandler);
authRoute.post("/refresh", refreshTokensHandler);

export default authRoute;
