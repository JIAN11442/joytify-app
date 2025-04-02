import mongoose from "mongoose";

import { MONGODB_CONNECTION_STRING } from "../constants/env-validate.constant";
import { applyMongooseExtensions } from "../extensions/mongoose.extension";

// performance config
const DB_CONNECTION_CONFIG = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 30000,
};

const connectMongoDB = async () => {
  try {
    // connection event listener
    mongoose.connection.on("connected", () => {
      console.log(
        `🟢 MongoDB Connected Successfully\n   ├─ Host: ${mongoose.connection.host}\n   ├─ Port: ${mongoose.connection.port}\n   ├─ Database: ${mongoose.connection.name}\n   └─ PoolSize: ${DB_CONNECTION_CONFIG.maxPoolSize}\n`
      );
    });

    // disconnected event listener
    mongoose.connection.on("disconnected", () => {
      console.error("🔴 MongoDB Disconnected!");
    });

    // checking current connection status
    if (mongoose.connection.readyState === 1) {
      console.log("\x1b[1mℹ️  Using existing MongoDB connection\x1b[0m");
      return mongoose;
    }

    // if not connected, connect to mongodb
    await mongoose.connect(MONGODB_CONNECTION_STRING, DB_CONNECTION_CONFIG);

    // apply mongoose extensions
    applyMongooseExtensions().then(() => console.log(`✅ Mongoose extensions applied\n`));

    return mongoose;
  } catch (error) {
    console.error("💥 MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectMongoDB;
