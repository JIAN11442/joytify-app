import { hashValue } from "./bcrypt.util";

const generateEmailWithThirdParty = async (email: string, provider: string) => {
  const splitEmail = email.split("@");
  const hashProvider = await hashValue(provider);

  return splitEmail[0] + `_${hashProvider}@` + splitEmail[1];
};

export default generateEmailWithThirdParty;
