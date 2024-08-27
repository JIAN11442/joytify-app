/* eslint-disable no-useless-catch */
import API from "../config/api-client.config";
import { resUser } from "../constants/data-type.constant";

// get user
export const getUserInfo = async (): Promise<resUser> => API.get("/user");
