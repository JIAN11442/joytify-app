import API from "../config/api-client.config";

// sign out all active devices
export const signOutAllActiveDevices = async () => API.delete("/session/sign-out-all");
