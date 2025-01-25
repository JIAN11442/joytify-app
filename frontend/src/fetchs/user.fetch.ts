/* eslint-disable no-useless-catch */
import API from "../config/api-client.config";
import { ResUser } from "../constants/axios-response.constant";

// get user
export const getUserInfo = async (): Promise<ResUser> => API.get("/user");

// deregister user account
export const deregisterUserAccount = async () => API.delete("/user/deregister");
