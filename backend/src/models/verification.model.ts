import mongoose, { UpdateQuery } from "mongoose";

import { SEND_LIMIT_PER_PERIOD } from "../constants/env-validate.constant";
import { HttpCode, ErrorCode } from "@joytify/shared-types/constants";
import { VerificationForType } from "@joytify/shared-types/types";
import { hashValue } from "../utils/bcrypt.util";
import appAssert from "../utils/app-assert.util";

export interface VerificationDocument extends mongoose.Document {
  email: string;
  type: VerificationForType;
  session: string;
  verification_code: string;
  times: number;
  expiresAt: Date;
  createdAt: Date;
}

const { TOO_MANY_REQUESTS } = HttpCode;

const verificationSchema = new mongoose.Schema<VerificationDocument>({
  email: { type: String, required: true },
  type: { type: String, required: true },
  session: { type: String },
  verification_code: { type: String },
  times: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, required: true, default: Date.now },
});

// hash verification code before saving
verificationSchema.pre("save", async function (next) {
  if (!this.isModified("verification_code")) {
    return next();
  }

  this.verification_code = await hashValue(this.verification_code);

  return next();
});

// hash verification code and  refresh times before update
verificationSchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getQuery();
  const update = this.getUpdate() as UpdateQuery<VerificationDocument>;
  const updateCode = update.verification_code;

  const doc = await VerificationModel.findOne(query);

  if (doc) {
    if (doc.times >= SEND_LIMIT_PER_PERIOD) {
      appAssert(
        false,
        TOO_MANY_REQUESTS,
        "Make too many requests",
        ErrorCode.VERIFICATION_CODE_RATE_LIMIT_EXCEEDED
      );
    }

    if (update.verification_code) {
      update.verification_code = await hashValue(updateCode);
    }

    update.times = doc.times + 1;
  }

  next();
});

const VerificationModel = mongoose.model<VerificationDocument>("verification", verificationSchema);

export default VerificationModel;
