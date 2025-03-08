import { Router } from "express";
import {
  sendCodeEmailHandler,
  sendLinkEmailHandler,
  verifyCodeHandler,
  verifyLinkHandler,
} from "../controllers/verification.controller";

const verificationRoute = Router();

verificationRoute.post("/send/code", sendCodeEmailHandler);
verificationRoute.post("/send/link", sendLinkEmailHandler);
verificationRoute.post("/verify/code", verifyCodeHandler);
verificationRoute.get("/verify/link/:token", verifyLinkHandler);

export default verificationRoute;
