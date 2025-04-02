import { hashValue } from "./bcrypt.util";

const { nanoid } = require("nanoid");

export const generateNanoId = async (hash: boolean): Promise<string> => {
  const session = nanoid();

  return hash ? await hashValue(session) : session;
};
