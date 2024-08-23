import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import awsRoute from "./routes/aws.route";
import songRoute from "./routes/song.route";
import ErrorHandler from "./middlewares/error-handler.middleware";
import authenticate from "./middlewares/authenticate.middleware";
import { ORIGIN_APP } from "./constants/env-validate.constant";

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ORIGIN_APP,
    credentials: true,
  })
);
app.use(cookieParser());

// routes
app.use("/auth", authRoute);
app.use("/user", authenticate, userRoute);
app.use("/aws", awsRoute);
app.use("/song", authenticate, songRoute);

// error handler
app.use(ErrorHandler);

export default app;
