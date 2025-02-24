import { RequestHandler } from "express";
import {
  sendCodeZodSchema,
  verifyCodeZodSchema,
} from "../schemas/verification-code.zod";
import {
  sendCodeToUser,
  verifyCode,
} from "../services/verification-code.service";
import { OK } from "../constants/http-code.constant";
import { setVerificationCookies } from "../utils/cookies.util";

// send verification code email handler
export const sendVerificationCodeEmailHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const token = req.cookies.vrfctToken;
    const data = sendCodeZodSchema.parse({ ...req.body, token });

    const { id, action, sessionToken } = await sendCodeToUser(data);

    if (sessionToken) {
      setVerificationCookies({ res, sessionToken });
    }

    return res.status(OK).json({ id, action });
  } catch (error) {
    next(error);
  }
};

// verify verification code handler
export const verifyVerificationCodeHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const token = req.cookies.vrfctToken;
    const { code, email } = verifyCodeZodSchema.parse({ ...req.body, token });

    const { verified } = await verifyCode({ code, email, token });

    res.status(OK).json({ verified });
  } catch (error) {
    next(error);
  }
};
