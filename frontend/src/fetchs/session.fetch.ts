import API from "../config/api-client.config";
import { API_ENDPOINTS } from "@joytify/types/constants";
import { SessionResponse } from "@joytify/types/types";

const { SESSIONS } = API_ENDPOINTS;

// get user sessions
export const getUserSessions = async (): Promise<SessionResponse[]> => API.get(SESSIONS);

// touch session heartbeat
export const touchSessionHeartBeat = async (): Promise<SessionResponse> =>
  API.patch(`${SESSIONS}/heartbeat`);

// delete session by id
export const signOutTargetDevice = async (id: string) => API.delete(`${SESSIONS}/${id}`);

// sign out all active devices
export const signOutAllActiveDevices = async () => API.delete(`${SESSIONS}/`);
