import { RequestHandler } from "express";
import {
  sendCodeZodSchema,
  sendLinkZodSchema,
  verifyCodeZodSchema,
} from "../schemas/verification.zod";
import {
  verifyCode,
  sendCodeEmailToUser,
  sendLinkEmailToUser,
  verifyLink,
} from "../services/verification.service";
import { HttpCode } from "@joytify/types/constants";
import { VerifyCodeRequest } from "@joytify/types/types";
import { clearVerificationCookies, setVerificationCookies } from "../utils/cookies.util";

const { OK } = HttpCode;

// send verification code email handler
export const sendCodeEmailHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.vrfctToken;
    const data = sendCodeZodSchema.parse({ ...req.body, token });

    const { id, action, sessionToken } = await sendCodeEmailToUser(data);

    if (sessionToken) {
      setVerificationCookies({ res, sessionToken });
    }

    return res.status(OK).json({ id, action });
  } catch (error) {
    next(error);
  }
};

// verify verification code handler
export const verifyCodeHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.vrfctToken;
    const params: VerifyCodeRequest = verifyCodeZodSchema.parse({ ...req.body, token });

    const { verified } = await verifyCode({ token, ...params });

    if (verified) {
      clearVerificationCookies(res);
    }

    res.status(OK).json({ verified });
  } catch (error) {
    next(error);
  }
};

// send verification link email handler
export const sendLinkEmailHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email } = sendLinkZodSchema.parse(req.body);

    const { url } = await sendLinkEmailToUser(email);

    return res.status(OK).json({ url });
  } catch (error) {
    next(error);
  }
};

// verify verification link handler
export const verifyLinkHandler: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.params;

    await verifyLink(token);

    res.status(OK).json({ verified: true });
  } catch (error) {
    next(error);
  }
};
