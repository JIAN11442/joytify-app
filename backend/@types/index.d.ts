import mongoose from "mongoose";
import { UserDocument } from "../src/models/user.model";
import { SessionDocument } from "../src/models/session.model";

// ===================== Global =====================

declare global {
  namespace Express {
    interface Request {
      userId: mongoose.Types.ObjectId | UserDocument["_id"];
      sessionId: mongoose.Types.ObjectId | SessionDocument["_id"];
      internalApiKey: string;
      adminApiKey: string;
    }
  }
}

// ===================== Mongoose =====================

declare module "mongoose" {
  interface Query<T, DocType, THelpers = {}, RawDocType> {
    forPagination(page?: number): Promise<{ page?: number; totalDocs: number; docs: T[] }>;
    remapFields(fields: Record<keyof T, string>): this;
  }
}
