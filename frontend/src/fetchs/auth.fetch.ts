import API from "../config/api-client.config";
import { DefaultsAuthType } from "../constants/form-default-data.constant";

// login axios
export const signin = async (data: DefaultsAuthType) =>
  API.post("/auth/login", data);

// register axios
export const signup = async (data: DefaultsAuthType) =>
  API.post("/auth/register", data);
