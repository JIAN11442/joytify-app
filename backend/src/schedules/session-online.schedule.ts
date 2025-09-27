import SessionModel from "../models/session.model";
import { SESSION_OFFLINE_TIMEOUT } from "../constants/env-validate.constant";

const ONLINE_CHECK_THRESHOLD = SESSION_OFFLINE_TIMEOUT * 60 * 1000;

export const sessionOnlineStatusCheckSchedule = () => {
  setInterval(async () => {
    const now = new Date();
    try {
      console.log("⏳ Checking session online status...");
      // find all sessions whose lastActive is earlier than (now - ONLINE_CHECK_THRESHOLD)
      // this means the session has not sent a heartbeat for at least ONLINE_CHECK_THRESHOLD minutes
      // then, set their status.online to false
      const updatedSessions = await SessionModel.updateMany(
        {
          "status.lastActive": { $lt: new Date(now.getTime() - ONLINE_CHECK_THRESHOLD) },
          "status.online": true,
        },
        { $set: { "status.online": false } }
      );

      console.log(`🟢 ${updatedSessions.modifiedCount} sessions updated`);
    } catch (error) {
      console.error("🔴 Session online status check error:", error);
    }
  }, ONLINE_CHECK_THRESHOLD);
};
