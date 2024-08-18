import bcrypt from "bcrypt";

export const HashValue = async (val: string, saltRound?: number) => {
  return bcrypt.hash(val, saltRound || 10);
};

export const CompareHashValue = async (val: string, hashVal: string) => {
  return bcrypt.compare(val, hashVal).catch((err) => false);
};
