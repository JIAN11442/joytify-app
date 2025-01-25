import mongoose from "mongoose";

export interface SessionDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDocument>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  userAgent: { type: String },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, required: true, default: Date.now },
});

const SessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);

export default SessionModel;
