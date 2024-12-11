/* eslint-disable no-useless-catch */
import API from "../config/api-client.config";
import { resUser } from "../constants/axios-response.constant";

// get user
export const getUserInfo = async (): Promise<resUser> => API.get("/user");

// deregister user account
export const deregisterUserAccount = async () => API.delete("/user/deregister");
