import API, { RefreshTokensClient } from "../config/api-client.config";

export type authParams = {
  email: string;
  password: string;
  confirmPassword?: string;
};

// login axios
export const login = async (data: authParams) => API.post("/auth/login", data);

// register axios
export const register = async (data: authParams) =>
  API.post("/auth/register", data);

// refresh token axios
export const refreshTokens = async () =>
  RefreshTokensClient.get("/auth/refresh");
