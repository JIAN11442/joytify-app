import { Router } from "express";
import {
  sendVerificationCodeEmailHandler,
  verifyVerificationCodeHandler,
} from "../controllers/verification-code.controller";

const verificationCodeRoute = Router();

verificationCodeRoute.post("/send", sendVerificationCodeEmailHandler);
verificationCodeRoute.post("/verify", verifyVerificationCodeHandler);

export default verificationCodeRoute;
