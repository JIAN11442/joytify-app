import mongoose, { UpdateQuery } from "mongoose";

import { TOO_MANY_REQUESTS } from "../constants/http-code.constant";
import ErrorCode from "../constants/error-code.constant";
import { VerificationForType } from "../constants/verification-code.constant";
import { HashValue } from "../utils/bcrypt.util";
import appAssert from "../utils/app-assert.util";

export interface VerificationCodeDocument extends mongoose.Document {
  session: string;
  email: string;
  type: VerificationForType;
  verification_code: string;
  times: number;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
  session: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true },
  verification_code: { type: String, required: true },
  times: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  createdAt: { type: Date, required: true, default: Date.now },
});

// hash verification code before saving
verificationCodeSchema.pre("save", async function (next) {
  if (!this.isModified("verification_code")) {
    return next();
  }

  this.verification_code = await HashValue(this.verification_code);
  this.times = 1;

  return next();
});

// hash verification code and  refresh times before update
verificationCodeSchema.pre("findOneAndUpdate", async function (next) {
  const query = this.getQuery();
  const update = this.getUpdate() as UpdateQuery<VerificationCodeDocument>;
  const updateCode = update.verification_code;

  const doc = await VerificationCodeModel.findOne(query);

  if (doc) {
    if (doc.times >= 3) {
      appAssert(
        false,
        TOO_MANY_REQUESTS,
        "Make too many requests",
        ErrorCode.VerificationCodeRateLimitExceeded
      );
    }

    update.verification_code = await HashValue(updateCode);
    update.times = doc.times + 1;
  }

  next();
});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>(
  "VerificationCode",
  verificationCodeSchema,
  "verification_codes"
);

export default VerificationCodeModel;
