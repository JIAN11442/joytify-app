import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
  NODE_ENV: str(),
  BACKEND_PORT: port(),
  ORIGIN_APP: str(),
  MONGODB_CONNECTION_STRING: str(),
  RESEND_API_KEY: str(),
  SENDER_EMAIL: str(),
  ACCESS_SECRET_KEY: str(),
  REFRESH_SECRET_KEY: str(),
});

export const {
  NODE_ENV,
  BACKEND_PORT,
  ORIGIN_APP,
  MONGODB_CONNECTION_STRING,
  RESEND_API_KEY,
  SENDER_EMAIL,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
} = env;
