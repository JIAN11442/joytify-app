import "dotenv/config";
import { createServer } from "http";

import app from "./app";
import { initializeSocket } from "./config/socket.config";
import connectMongoDB from "./config/connect-mongodb.config";
import { sessionOnlineStatusCheckSchedule } from "./schedules/session-online.schedule";
import { API_PORT } from "./constants/env-validate.constant";
import consoleLogBox from "./utils/console-boxes.util";

const startServer = async () => {
  try {
    // 1. initialize mongodb connection
    console.log(`\n⏳ Initializing MongoDB connection...\n`);

    const db = await connectMongoDB();

    if (db.connection.readyState !== 1) {
      throw new Error("Database connection not healthy");
    }

    // 2. initialize socket server
    console.log(`\n⏳ Initializing Socket server...\n`);

    const server = createServer(app);

    initializeSocket(server);

    server.listen(API_PORT, () => {
      consoleLogBox(`🚀 Server ready at http://localhost:${API_PORT}`);
    });

    sessionOnlineStatusCheckSchedule();
  } catch (error) {
    console.error("💀 Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
