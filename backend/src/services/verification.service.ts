import { FilterQuery } from "mongoose";

import UserModel from "../models/user.model";
import VerificationModel, {
  VerificationDocument,
} from "../models/verification.model";

import { JoytifyVerificationCodeEmail } from "../templates/verification-code.template";
import { JoytifyResetPasswordLinkEmail } from "../templates/reset-password.template";
import {
  VerificationForOptions,
  VerificationCodeActions,
} from "../constants/verification.constant";
import {
  CONFLICT,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http-code.constant";
import {
  NODE_ENV,
  SENDER_EMAIL,
  TEST_EMAIL,
} from "../constants/env-validate.constant";
import appAssert from "../utils/app-assert.util";
import { tenMinutesFromNow } from "../utils/date.util";
import {
  generateVerificationCode,
  generateVerificationLink,
} from "../utils/generate-code.util";
import {
  signToken,
  VerificationTokenPayload,
  VerificationTokenSignOptions,
  verifyToken,
} from "../utils/jwt.util";
import { generateNanoId } from "../utils/generate-nanoid.util";
import { compareHashValue } from "../utils/bcrypt.util";
import resend from "../config/resend.config";

type SendEmailParams = {
  from?: string;
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

type FilterQueryParams = FilterQuery<VerificationDocument>;

const { EMAIL_VERIFICATION, PASSWORD_RESET } = VerificationForOptions;

// send email service
export const sendEmail = async ({
  content,
  from = NODE_ENV === "development" ? TEST_EMAIL : SENDER_EMAIL,
  ...rest
}: SendEmailParams) => {
  const { data, error } = await resend.emails.send({
    ...rest,
    from,
    react: content,
  });

  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    error ? error.message : "Failed to send email"
  );
};

// send verification code service
export const sendCodeEmailToUser = async (params: SendCodeParams) => {
  const { email, shouldResendCode, token } = params;

  const { CODE_CREATED, CODE_UPDATED, CODE_RETURNED } = VerificationCodeActions;

  // if email exists in user collection, means email is already in use
  const [isEmailExists, isVerifying] = await Promise.all([
    UserModel.findOne({ email }),
    VerificationModel.findOne({ email, type: EMAIL_VERIFICATION }),
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
  const code = generateVerificationCode();
  // const code = "K-108866";
  const content = JoytifyVerificationCodeEmail({ verificationCode: code });
  const subject = `${code} is your Joytify verification code`;
  const hashedSession = await generateNanoId(true);

  const queryParams: FilterQueryParams = { email, type: EMAIL_VERIFICATION };
  const payloadParams: FilterQueryParams = {
    session: hashedSession,
    verification_code: code,
    expiresAt: tenMinutesFromNow(),
  };

  let doc;

  // update existing verification record or create a new one
  if (isVerifying) {
    doc = await VerificationModel.findOneAndUpdate(queryParams, payloadParams, {
      new: true,
    });
  } else {
    doc = await VerificationModel.create({
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
  await sendEmail({ to: email, subject, content });

  return {
    id: doc._id,
    action: isVerifying ? CODE_UPDATED : CODE_CREATED,
    sessionToken,
  };
};

// send verification link service
export const sendLinkEmailToUser = async (email: string) => {
  // check user exists
  const user = await UserModel.findOne({ email });

  appAssert(user, NOT_FOUND, "User not found");
  appAssert(
    !user.auth_for_third_party,
    FORBIDDEN,
    "This account was registered using a third-party service. Password reset is not supported."
  );

  // generate verification code
  const sessionId = await generateNanoId(false);

  // defined query params
  const queryParams: FilterQueryParams = { email, type: PASSWORD_RESET };
  const payloadParams: FilterQueryParams = {
    session: sessionId,
    expiresAt: tenMinutesFromNow(),
  };

  // check if verification code exists
  const doc = await VerificationModel.findOne(queryParams);

  if (doc) {
    // update verification doc
    const updateDoc = await VerificationModel.findOneAndUpdate(
      queryParams,
      payloadParams
    );

    appAssert(
      updateDoc,
      INTERNAL_SERVER_ERROR,
      "Failed to update verification doc"
    );
  } else {
    // create verification doc
    const newDoc = await VerificationModel.create({
      ...queryParams,
      ...payloadParams,
    });

    appAssert(
      newDoc,
      INTERNAL_SERVER_ERROR,
      "Failed to create verification doc"
    );
  }

  // generate verification link
  const url = await generateVerificationLink(sessionId);
  const username = email.split("@")[0];
  const content = JoytifyResetPasswordLinkEmail({ url, username });
  const subject = "Reset your password for Joytify";

  // send email
  await sendEmail({ to: email, subject, content });

  return { url };
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

    const verifyDoc = await VerificationModel.findOne(queryParams);

    if (verifyDoc) {
      verified = await compareHashValue(code, verifyDoc.verification_code);

      if (verified) {
        // delete verification code
        const deletedVerificationCode =
          await VerificationModel.findOneAndDelete(queryParams);

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

// verify verification link service
export const verifyLink = async (token: string) => {
  const { payload } = await verifyToken<VerificationTokenPayload>(token, {
    secret: VerificationTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid or expired verification token");

  const { sessionId } = payload;
  const verification = await VerificationModel.findOne({
    session: sessionId,
    type: PASSWORD_RESET,
  });

  appAssert(verification, UNAUTHORIZED, "Invalid or expired verification link");

  return { verified: true };
};
