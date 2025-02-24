import { FilterQuery } from "mongoose";

import UserModel from "../models/user.model";
import VerificationCodeModel, {
  VerificationCodeDocument,
} from "../models/verification-code.model";

import resend from "../config/resend.config";
import JoytifyVerifyEmail from "../templates/register.template";
import {
  VerificationForOptions,
  VerificationCodeActions,
} from "../constants/verification-code.constant";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from "../constants/http-code.constant";
import {
  NODE_ENV,
  SENDER_EMAIL,
  TEST_EMAIL,
} from "../constants/env-validate.constant";
import appAssert from "../utils/app-assert.util";
import { tenMinutesFromNow } from "../utils/date.util";
import generateVerificationCode from "../utils/generate-code.util";
import {
  signToken,
  VerificationTokenPayload,
  VerificationTokenSignOptions,
  verifyToken,
} from "../utils/jwt.util";
import { generateSessionId } from "../utils/generate-session.util";
import { CompareHashValue } from "../utils/bcrypt.util";

type SendEmailParams = {
  from: string;
  to: string;
  subject: string;
  content: React.JSX.Element;
};

type DefaultCodeParams = {
  email: string;
  token?: string;
};

interface SendCodeParams extends DefaultCodeParams {
  shouldResendCode: boolean;
}

interface VerifyCodeParams extends DefaultCodeParams {
  code: string;
}

type FilterQueryParams = FilterQuery<VerificationCodeDocument>;

const { EMAIL_VERIFICATION } = VerificationForOptions;

// send email service
export const sendEmail = async (params: SendEmailParams) => {
  const { content, ...rest } = params;

  const { data, error } = await resend.emails.send({
    ...rest,
    react: content,
  });

  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    error ? error.message : "Failed to send email"
  );
};

// send verification code service
export const sendCodeToUser = async (params: SendCodeParams) => {
  const { email, shouldResendCode, token } = params;
  const { CODE_CREATED, CODE_UPDATED, CODE_RETURNED } = VerificationCodeActions;

  // if email exists in user collection, means email is already in use
  const [isEmailExists, isVerifying] = await Promise.all([
    UserModel.findOne({ email }),
    VerificationCodeModel.findOne({ email, type: EMAIL_VERIFICATION }),
  ]);

  appAssert(!isEmailExists, CONFLICT, "Email is already in use");

  // if email verification is in progress, check if session matches
  if (isVerifying) {
    const { payload } = await verifyToken<VerificationTokenPayload>(token, {
      secret: VerificationTokenSignOptions.secret,
    });

    appAssert(
      payload?.sessionId === isVerifying.session,
      CONFLICT,
      "Email is already in use"
    );

    // If resending is not required, return the existing verification record
    if (!shouldResendCode) {
      return {
        id: isVerifying._id,
        action: CODE_RETURNED,
        sessionToken: null,
      };
    }
  }

  // generate a new verification code and session ID
  // const code = generateVerificationCode();
  const code = "K-108866";
  const content = JoytifyVerifyEmail({ verificationCode: code });
  const subject = "Please verify your email";
  const from = NODE_ENV === "development" ? TEST_EMAIL : SENDER_EMAIL;
  const hashedSession = await generateSessionId(true);

  const queryParams: FilterQueryParams = { email, type: EMAIL_VERIFICATION };
  const payloadParams: FilterQueryParams = {
    session: hashedSession,
    verification_code: code,
    expiresAt: tenMinutesFromNow(),
  };

  let doc;

  // update existing verification record or create a new one
  if (isVerifying) {
    doc = await VerificationCodeModel.findOneAndUpdate(
      queryParams,
      payloadParams,
      { new: true }
    );
  } else {
    doc = await VerificationCodeModel.create({
      ...queryParams,
      ...payloadParams,
    });
  }

  appAssert(doc, INTERNAL_SERVER_ERROR, "Failed to process verification code");

  // generate a new session token for verification tracking
  const sessionToken = signToken(
    { sessionId: hashedSession },
    VerificationTokenSignOptions
  );

  // send verification email
  // await sendEmail({ from, to: email, subject, content });

  return {
    id: doc._id,
    action: isVerifying ? CODE_UPDATED : CODE_CREATED,
    sessionToken,
  };
};

// verify verification code service
export const verifyCode = async (params: VerifyCodeParams) => {
  let verified = false;

  const { code, email, token } = params;

  if (token) {
    const { payload } = await verifyToken<VerificationTokenPayload>(token, {
      secret: VerificationTokenSignOptions.secret,
    });

    const queryParams: FilterQueryParams = {
      email,
      session: payload?.sessionId,
      type: EMAIL_VERIFICATION,
    };

    const verifyDoc = await VerificationCodeModel.findOne(queryParams);

    if (verifyDoc) {
      verified = await CompareHashValue(code, verifyDoc.verification_code);

      if (verified) {
        const deletedVerificationCode =
          await VerificationCodeModel.findOneAndDelete(queryParams);

        appAssert(
          deletedVerificationCode,
          INTERNAL_SERVER_ERROR,
          "Failed to delete verification code"
        );
      }
    }
  }

  return { verified };
};
