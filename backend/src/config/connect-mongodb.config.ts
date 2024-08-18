import mongoose from "mongoose";

import { MONGODB_CONNECTION_STRING } from "../constants/env-validate.constant";
import ConsoleLogBox from "../utils/console-boxes.util";

const ConnectMongoDB = async () => {
  try {
    // connect to MongoDB
    mongoose.connect(MONGODB_CONNECTION_STRING);

    // console log if MongoDB is connected successfully
    return ConsoleLogBox("MongoDB Connected Successfully");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default ConnectMongoDB;
