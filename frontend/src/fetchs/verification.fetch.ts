import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from "@joytify/types/types";

const { VERIFICATION } = API_ENDPOINTS;

// send verification code
export const sendVerificationCode = async (params: SendCodeRequest): Promise<SendCodeResponse> =>
  API.post(`${VERIFICATION}/send/code`, params);

// send verification link
export const sendResetPasswordEmail = async (email: string) =>
  API.post(`${VERIFICATION}/send/link`, { email });

// verify verification code
export const verifyVerificationCode = async (
  params: VerifyCodeRequest
): Promise<VerifyCodeResponse> => API.post(`${VERIFICATION}/verify/code`, params);

// verify reset password link
export const verifyResetPasswordLink = async (token: string) =>
  API.get(`${VERIFICATION}/verify/link/${token}`);
