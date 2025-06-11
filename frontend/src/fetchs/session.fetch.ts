import API from "../config/api-client.config";
import { SessionResponse } from "@joytify/shared-types/types";

// get user sessions
export const getUserSessions = async (): Promise<SessionResponse[]> => API.get("/session");

// delete session by id
export const signOutTargetDevice = async (id: string) => API.delete(`/session/${id}`);

// sign out all active devices
export const signOutAllActiveDevices = async () => API.delete("/session/sign-out-all");

// touch session heartbeat
export const touchSessionHeartBeat = async (): Promise<SessionResponse> =>
  API.patch("/session/heartbeat");
