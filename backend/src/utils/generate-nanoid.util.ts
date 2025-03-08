import { nanoid } from "nanoid";
import { hashValue } from "./bcrypt.util";

export const generateNanoId = async (hash: boolean): Promise<string> => {
  const session = nanoid();

  return hash ? await hashValue(session) : session;
};
