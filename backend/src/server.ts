import "dotenv/config";
import app from "./app";
import connectMongoDB from "./config/connect-mongodb.config";
import { BACKEND_PORT } from "./constants/env-validate.constant";
import consoleLogBox from "./utils/console-boxes.util";

const startServer = async () => {
  try {
    console.log(`\n⏳ Initializing MongoDB connection...\n`);

    const db = await connectMongoDB();

    if (db.connection.readyState !== 1) {
      throw new Error("Database connection not healthy");
    }

    app.listen(BACKEND_PORT, () => {
      consoleLogBox(`🚀 Server ready at http://localhost:${BACKEND_PORT}`);
    });
  } catch (error) {
    console.error("💀 Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
