import API from "../config/api-client.config";

// get user
export const getUserInfo = async () => API.get("/user");
