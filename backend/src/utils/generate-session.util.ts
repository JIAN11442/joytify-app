import { nanoid } from "nanoid";
import { HashValue } from "./bcrypt.util";

export const generateSessionId = async (hash: boolean): Promise<string> => {
  const session = nanoid();

  return hash ? await HashValue(session) : session;
};
