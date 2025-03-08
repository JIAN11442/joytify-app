import UserModel from "../models/user.model";
import VerificationModel from "../models/verification.model";
import { UNAUTHORIZED } from "../constants/http-code.constant";
import { VerificationForOptions } from "../constants/verification.constant";
import appAssert from "../utils/app-assert.util";
import { compareHashValue } from "../utils/bcrypt.util";
import {
  VerificationTokenPayload,
  VerificationTokenSignOptions,
  verifyToken,
} from "../utils/jwt.util";
import { JoytifyPasswordChangedEmail } from "../templates/password-changed.template";
import { sendEmail } from "./verification.service";

type ResetPasswordParams = {
  token: string;
  currentPassword: string;
  newPassword: string;
};

const { PASSWORD_RESET } = VerificationForOptions;

// reset password service
export const resetUserPassword = async (data: ResetPasswordParams) => {
  const { token, currentPassword, newPassword } = data;

  // verify token to get session ID
  const { payload } = await verifyToken<VerificationTokenPayload>(token, {
    secret: VerificationTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid or expired token");

  // get target verification doc
  const verificationDoc = await VerificationModel.findOne({
    session: payload.sessionId,
    type: PASSWORD_RESET,
  });

  appAssert(verificationDoc, UNAUTHORIZED, "Invalid or expired token");

  // check user if exist
  const user = await UserModel.findOne({ email: verificationDoc.email });

  appAssert(user, UNAUTHORIZED, "Invalid or expired token");

  // check current password is match
  const passwordIsMatch = await compareHashValue(
    currentPassword,
    user.password
  );

  appAssert(passwordIsMatch, UNAUTHORIZED, "Invalid current password");

  // update user password
  user.password = newPassword;
  await user.save();

  // delete relative verification
  await verificationDoc.deleteOne();

  // send email
  const username = user.email.split("@")[0];
  const content = JoytifyPasswordChangedEmail({ username });
  const subject = "Your Joytify password has been changed";

  await sendEmail({ to: user.email, subject, content });

  return { user: user.omitPassword() };
};
