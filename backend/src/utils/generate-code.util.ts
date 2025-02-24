import crypto from "crypto";

const generateVerificationCode = () => {
  const letter = String.fromCharCode(
    65 + (crypto.getRandomValues(new Uint8Array(1))[0] % 26)
  );

  const numbers = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  const code = `${letter}-${numbers}`;

  return code;
};

export default generateVerificationCode;
