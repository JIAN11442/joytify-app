import crypto from "crypto";
import { ORIGIN_APP } from "../constants/env-validate.constant";
import { signToken, VerificationTokenSignOptions } from "./jwt.util";

export const generateVerificationCode = () => {
  const letter = String.fromCharCode(
    65 + (crypto.getRandomValues(new Uint8Array(1))[0] % 26)
  );

  const numbers = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  const code = `${letter}-${numbers}`;

  return code;
};

export const generateVerificationLink = async (sessionId: string) => {
  const token = signToken({ sessionId }, VerificationTokenSignOptions);

  const url = `${ORIGIN_APP}/password/reset?token=${token}`;

  return url;
};
