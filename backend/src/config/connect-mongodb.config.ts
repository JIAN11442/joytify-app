import mongoose from "mongoose";

import { MONGODB_CONNECTION_STRING } from "../constants/env-validate.constant";
import consoleLogBox from "../utils/console-boxes.util";

const connectMongoDB = async () => {
  try {
    mongoose.connect(MONGODB_CONNECTION_STRING);

    return consoleLogBox("MongoDB Connected Successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectMongoDB;
