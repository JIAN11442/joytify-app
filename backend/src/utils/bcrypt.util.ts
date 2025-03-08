import bcrypt from "bcrypt";

export const hashValue = async (val: string, saltRound?: number) => {
  return bcrypt.hash(val, saltRound || 10);
};

export const compareHashValue = async (val: string, hashVal: string) => {
  return bcrypt.compare(val, hashVal).catch((err) => false);
};
