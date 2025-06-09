import API from "../config/api-client.config";
import { SessionResponse } from "@joytify/shared-types/types";

// sign out all active devices
export const signOutAllActiveDevices = async () => API.delete("/session/sign-out-all");

// touch session heartbeat
export const touchSessionHeartBeat = async (): Promise<SessionResponse> =>
  API.patch("/session/heartbeat");
