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
  params: SendCodeParams
): Promise<ResSendCode> => API.post("/verification/send/code", params);

// verify verification code
export const verifyVerificationCode = async (
  params: VerifyCodeParams
): Promise<ResVerifyCode> => API.post("/verification/verify/code", params);

// send verification link
export const sendResetPasswordEmail = async (email: string) =>
  API.post("/verification/send/link", { email });

// verify reset password link
export const verifyResetPasswordLink = async (token: string) =>
  API.get(`/verification/verify/link/${token}`);
