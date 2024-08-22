import API from "../config/api-client.config";

export type authParams = {
  email: string;
  password: string;
  confirmPassword?: string;
};

// login axios
export const signin = async (data: authParams) => API.post("/auth/login", data);

// register axios
export const signup = async (data: authParams) =>
  API.post("/auth/register", data);
