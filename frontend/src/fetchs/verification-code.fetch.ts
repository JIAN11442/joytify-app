import API from "../config/api-client.config";
import {
  ResSendCode,
  ResVerifyCode,
} from "../constants/axios-response.constant";

type DefaultParams = {
  email: string;
};

export interface SendCodeParams extends DefaultParams {
  shouldResendCode: boolean;
  registerFn?: () => void;
}

export interface VerifyCodeParams extends DefaultParams {
  code: string;
}

// send verification code
export const sendVerificationCode = async (
  data: SendCodeParams
): Promise<ResSendCode> => API.post("/verification-code/send", data);

// verify verification code
export const verifyVerificationCode = async (
  data: VerifyCodeParams
): Promise<ResVerifyCode> => API.post("/verification-code/verify", data);
