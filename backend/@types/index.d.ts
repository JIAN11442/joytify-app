import mongoose from "mongoose";
import { UserDocument } from "../src/models/user.model";
import { SessionDocument } from "../src/models/session.model";

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectId | UserDocument["_id"];
      sessionId: mongoose.Types.ObjectId | SessionDocument["_id"];
    }
  }
}
